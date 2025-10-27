import { STORAGE_PATHS } from "@careerfairy/shared-lib/constants/storagePaths"
import { PresentationConversionStatus } from "@careerfairy/shared-lib/livestreams"
import { retryWithBackoff } from "@careerfairy/shared-lib/utils"
import type { Bucket } from "@google-cloud/storage"
import { createCanvas } from "canvas"
import { logger } from "firebase-functions/v2"
import { onObjectFinalized } from "firebase-functions/v2/storage"
import { getDocument, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist"
import { FieldValue, firestore, storage } from "./api/firestoreAdmin"

const DPI_SCALE = 4 // 4x scale for ultra-high-quality rendering (equivalent to 384 DPI)

/**
 * Converts a single PDF page to a high-resolution PNG image
 */
async function convertPageToImage(page: PDFPageProxy): Promise<Buffer> {
   const viewport = page.getViewport({ scale: DPI_SCALE })
   const canvas = createCanvas(viewport.width, viewport.height)
   const context = canvas.getContext("2d")

   await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport: viewport,
      intent: "print",
   }).promise

   return canvas.toBuffer("image/png")
}

/**
 * Process a single PDF page: convert to image and upload to Storage
 */
async function processPage(
   pdf: PDFDocumentProxy,
   pageNum: number,
   livestreamId: string,
   bucket: Bucket
): Promise<string> {
   logger.info(
      `Converting page ${pageNum}/${pdf.numPages} for livestream ${livestreamId}`
   )

   const page = await pdf.getPage(pageNum)
   const imageBuffer = await convertPageToImage(page)

   // Upload to Storage with retry logic
   const imagePath = `${STORAGE_PATHS.presentations}/${livestreamId}/page-${pageNum}.png`
   const file = bucket.file(imagePath)

   await retryWithBackoff(async () => {
      await file.save(imageBuffer, {
         metadata: {
            contentType: "image/png",
            metadata: {
               livestreamId,
               pageNumber: pageNum.toString(),
               generatedFrom: "pdf-conversion",
            },
         },
      })
   })

   // Make the file publicly readable with retry
   await retryWithBackoff(async () => {
      await file.makePublic()
   })

   // Get the public URL
   const url = file.publicUrl()
   logger.info(`Page ${pageNum} uploaded to ${url}`)

   return url
}

/**
 * Converts all pages of a PDF to high-resolution images and uploads them to Storage
 * Processes pages sequentially to avoid overwhelming storage
 */
async function convertPdfToImages(
   pdfBuffer: Buffer,
   livestreamId: string
): Promise<string[]> {
   const bucket = storage.bucket()
   const BATCH_SIZE = 1

   // Load the PDF
   const pdf = await getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
   }).promise

   const presentationRef = firestore
      .collection("livestreams")
      .doc(livestreamId)
      .collection("presentations")
      .doc("presentation")

   // Update status to converting and set total pages
   await presentationRef.update({
      conversionStatus: PresentationConversionStatus.CONVERTING,
      totalPages: pdf.numPages,
      conversionProgress: `0 of ${pdf.numPages}`,
   })

   logger.info(
      `Starting conversion of ${pdf.numPages} pages for livestream ${livestreamId} (batches of ${BATCH_SIZE})`
   )

   const imageUrls: string[] = []

   // Process pages in batches
   for (let i = 0; i < pdf.numPages; i += BATCH_SIZE) {
      const batchStart = i + 1
      const batchEnd = Math.min(i + BATCH_SIZE, pdf.numPages)

      logger.info(
         `Processing batch: pages ${batchStart}-${batchEnd} of ${pdf.numPages}`
      )

      // Process this batch in parallel
      const batchPromises = []
      for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
         batchPromises.push(processPage(pdf, pageNum, livestreamId, bucket))
      }

      const batchUrls = await Promise.all(batchPromises)
      imageUrls.push(...batchUrls)

      // Update progress after each batch
      await presentationRef.update({
         conversionProgress: `${imageUrls.length} of ${pdf.numPages}`,
      })
   }

   return imageUrls
}

/**
 * Firebase Storage trigger: When a PDF is uploaded to company_documents, convert it to high-res images
 */
export const onPresentationUpload = onObjectFinalized(
   {
      memory: "2GiB",
      timeoutSeconds: 540, // 9 minutes max
   },
   async (event) => {
      const filePath = event.data?.name
      if (!filePath) {
         return
      }

      // Only process PDFs in company_documents folder
      if (
         !filePath.startsWith(STORAGE_PATHS.presentations + "/") ||
         !filePath.endsWith(".pdf")
      ) {
         logger.info(`Skipping non-PDF file: ${filePath}`)
         return
      }

      // Extract livestream ID from path (company_documents/{livestreamId}.pdf or similar)
      const pathParts = filePath.split("/")
      const fileName = pathParts[pathParts.length - 1]
      const livestreamId = fileName.replace(".pdf", "").split(".")[0]

      if (!livestreamId) {
         logger.error(`Could not extract livestreamId from path: ${filePath}`)
         return
      }

      logger.info(
         `Starting PDF conversion for livestream ${livestreamId} from ${filePath}`
      )

      const presentationRef = firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("presentations")
         .doc("presentation")

      try {
         const bucket = storage.bucket()
         const file = bucket.file(filePath)

         // Download the PDF
         const [pdfBuffer] = await file.download()

         // Convert PDF to images (this updates status internally)
         const imageUrls = await convertPdfToImages(pdfBuffer, livestreamId)

         // Update Firestore with final results
         await presentationRef.update({
            imageUrls,
            imageConversionCompletedAt: FieldValue.serverTimestamp(),
            conversionStatus: PresentationConversionStatus.COMPLETED,
            conversionProgress: `${imageUrls.length} of ${imageUrls.length}`,
         })

         logger.info(
            `Successfully converted ${imageUrls.length} pages for livestream ${livestreamId}`
         )
      } catch (error) {
         logger.error(
            `Failed to convert PDF for livestream ${livestreamId}:`,
            error
         )

         // Update status to failed
         await presentationRef.update({
            conversionStatus: PresentationConversionStatus.FAILED,
         })

         throw error
      }
   }
)
