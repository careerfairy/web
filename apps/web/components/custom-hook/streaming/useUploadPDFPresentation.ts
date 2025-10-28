import { STORAGE_PATHS } from "@careerfairy/shared-lib/constants/storagePaths"
import { PresentationConversionStatus } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import {
   deleteField,
   increment,
   serverTimestamp,
   updateDoc,
} from "firebase/firestore"
import { useCallback, useMemo } from "react"
import { errorLogAndNotify, sanitizeFileName } from "util/CommonUtil"
import { v4 as uuid } from "uuid"
import useFirebaseUpload from "../useFirebaseUpload"
import useUploadFile from "../useUploadFile"

/**
 * Hook that provides functionality to upload a live stream PDF presentation to Firebase storage.
 *
 * @returns An object containing upload related state and methods.
 */
const useUploadPDFPresentation = (livestreamId: string) => {
   // Upload handler for the main PDF (without callback to avoid race conditions)
   const pdfUpload = useUploadFile(STORAGE_PATHS.presentations)

   // Low-level uploader for page images
   const [uploadToStorage] = useFirebaseUpload()

   const handleUploadFile = useCallback(
      async (file: File, customFileName?: string) => {
         const fileExtension = file.name.split(".").pop() || "pdf"
         const generatedName = customFileName
            ? sanitizeFileName(customFileName)
            : uuid()

         const pdfStoragePath = `${STORAGE_PATHS.presentations}/${generatedName}.${fileExtension}`

         // 1) Upload original PDF to storage
         const pdfMeta = await pdfUpload.handleUploadFile(file, generatedName)

         // 2) Create presentation doc with PDF download URL (fallback)
         await livestreamService.setLivestreamPDFPresentation({
            livestreamId,
            downloadUrl: pdfMeta.url,
            storagePath: pdfStoragePath,
            fileSize: file.size,
            fileName: file.name,
         })

         // 3) Client-side conversion: render pages to PNG and upload
         const presentationRef =
            livestreamService.getPresentationRef(livestreamId)

         // Mark as converting and reset fields
         await updateDoc(presentationRef, {
            conversionStatus: PresentationConversionStatus.CONVERTING,
            convertedPages: 0,
            imageUrls: [],
            imageConversionCompletedAt: deleteField(),
            conversionError: deleteField(),
         })

         try {
            // Load PDF.js lazily on client
            const pdfjs = await import("pdfjs-dist/build/pdf")
            // Configure worker using the same pattern as other components
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyPdfjs = pdfjs as any
            anyPdfjs.GlobalWorkerOptions.workerSrc = new URL(
               "pdfjs-dist/build/pdf.worker.min.js",
               import.meta.url as unknown as string
            ).toString()

            const arrayBuffer = await file.arrayBuffer()
            const loadingTask = anyPdfjs.getDocument({ data: arrayBuffer })
            const pdf = await loadingTask.promise

            const totalPages: number = pdf.numPages

            await updateDoc(presentationRef, {
               conversionStatus: PresentationConversionStatus.UPLOADING,
               totalPages,
            })

            // High-quality rendering at 1080p resolution
            const TARGET_WIDTH = 1920 // Full HD width (1920x1080)
            const CONCURRENCY = Math.min(3, totalPages)
            const imageUrls: string[] = new Array(totalPages)

            let currentPage = 1
            const runWorker = async () => {
               while (currentPage <= totalPages) {
                  const pageIndex = currentPage++

                  const page = await pdf.getPage(pageIndex)
                  const viewport = page.getViewport({ scale: 1 })
                  const scale = TARGET_WIDTH / viewport.width

                  // Apply 2x pixel ratio for extra sharpness (similar to Retina displays)
                  const PIXEL_RATIO = 2
                  const scaledViewport = page.getViewport({
                     scale: scale * PIXEL_RATIO,
                  })

                  const canvas = document.createElement("canvas")
                  const ctx = canvas.getContext("2d", { alpha: false })!
                  canvas.width = Math.floor(scaledViewport.width)
                  canvas.height = Math.floor(scaledViewport.height)

                  await page.render({
                     canvasContext: ctx,
                     viewport: scaledViewport,
                  }).promise

                  const blob: Blob = await new Promise((resolve, reject) =>
                     canvas.toBlob(
                        (b) =>
                           b ? resolve(b) : reject(new Error("toBlob failed")),
                        "image/png"
                     )
                  )

                  // Cleanup canvas memory immediately
                  canvas.width = 0
                  canvas.height = 0

                  // Upload image
                  const imagePath = `${STORAGE_PATHS.presentations}/${livestreamId}/page-${pageIndex}.png`
                  const imageFile = new File([blob], `page-${pageIndex}.png`, {
                     type: "image/png",
                  })
                  const url = await uploadToStorage(imageFile, imagePath)

                  imageUrls[pageIndex - 1] = url

                  // Update progress
                  await updateDoc(presentationRef, {
                     convertedPages: increment(1),
                  })
               }
            }

            await Promise.all(Array.from({ length: CONCURRENCY }, runWorker))

            // Finalize
            await updateDoc(presentationRef, {
               imageUrls,
               imageConversionCompletedAt: serverTimestamp(),
               conversionStatus: PresentationConversionStatus.COMPLETED,
               convertedPages: imageUrls.length,
            })
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error during PDF conversion",
               livestreamId,
            })
            await updateDoc(presentationRef, {
               conversionStatus: PresentationConversionStatus.FAILED,
               conversionError:
                  e instanceof Error ? e.message : "Unknown error",
            })

            throw e
         }

         return pdfMeta
      },
      [livestreamId, pdfUpload, uploadToStorage]
   )

   return useMemo(
      () => ({ ...pdfUpload, handleUploadFile }),
      [pdfUpload, handleUploadFile]
   )
}

export default useUploadPDFPresentation
