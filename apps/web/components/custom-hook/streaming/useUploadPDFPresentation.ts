import { STORAGE_PATHS } from "@careerfairy/shared-lib/constants/storagePaths"
import {
   ImageConversionStatus,
   type ImageConversionState,
} from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { increment, serverTimestamp, updateDoc } from "firebase/firestore"
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
         const presentationRef =
            livestreamService.getPresentationRef(livestreamId)

         // 1) Create presentation doc with PENDING status FIRST (before upload starts)
         // This ensures imageConversion state exists from the very beginning
         await livestreamService.setLivestreamPDFPresentation({
            livestreamId,
            downloadUrl: "", // Will be updated after upload
            storagePath: pdfStoragePath,
            fileSize: file.size,
            fileName: file.name,
         })

         // 2) Upload original PDF to storage (progress tracked in PENDING state)
         const pdfMeta = await pdfUpload.handleUploadFile(file, generatedName)

         // 3) Update document with PDF download URL
         await updateDoc(presentationRef, {
            downloadUrl: pdfMeta.url,
         })

         // 4) Mark as converting (now we'll convert PDF to images)
         const convertingState: ImageConversionState = {
            status: ImageConversionStatus.CONVERTING,
            totalPages: 0,
            convertedPages: 0,
         }
         await updateDoc(presentationRef, {
            imageConversion: convertingState,
         })

         let totalPages = 0
         let imageUrls: string[] = []

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

            totalPages = pdf.numPages

            // Mark as uploading (now we know totalPages)
            const uploadingState: ImageConversionState = {
               status: ImageConversionStatus.UPLOADING,
               totalPages,
               convertedPages: 0,
            }
            await updateDoc(presentationRef, {
               imageConversion: uploadingState,
            })

            // High-quality rendering at 1080p resolution
            const TARGET_WIDTH = 1920 // Full HD width (1920x1080)
            const CONCURRENCY = Math.min(3, totalPages)
            imageUrls = new Array(totalPages)

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

                  // Update progress (increment convertedPages in nested imageConversion)
                  await updateDoc(presentationRef, {
                     "imageConversion.convertedPages": increment(1),
                  })
               }
            }

            await Promise.all(Array.from({ length: CONCURRENCY }, runWorker))

            // Finalize - mark as completed
            const completedState: ImageConversionState = {
               status: ImageConversionStatus.COMPLETED,
               totalPages: imageUrls.length,
               imageUrls,
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               completedAt: serverTimestamp() as any,
            }
            await updateDoc(presentationRef, {
               imageConversion: completedState,
            })
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error during PDF conversion",
               livestreamId,
            })

            const failedState: ImageConversionState = {
               status: ImageConversionStatus.FAILED,
               error: e instanceof Error ? e.message : "Unknown error",
               totalPages,
               convertedPages: imageUrls.filter(Boolean).length,
            }
            await updateDoc(presentationRef, {
               imageConversion: failedState,
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
