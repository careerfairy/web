import { useState, useEffect, useCallback } from "react"
import FirebaseInstance from "../../data/firebase/FirebaseInstance"

type UseFirebaseUploadReturnType = [
   (file: File, fileName: string) => Promise<string>, // Function to trigger file upload
   number, // Progress of upload
   boolean, // Whether upload is currently in progress
   Error | null, // Error that occurred during upload (if any)
   string | null // Download URL of uploaded file (if upload was successful)
]

const useFirebaseUpload = (
   path: string,
   onSuccess?: (downloadURL: string) => void,
   onError?: (error: Error) => void
): UseFirebaseUploadReturnType => {
   const [uploadProgress, setUploadProgress] = useState<number>(0)
   const [isUploading, setIsUploading] = useState<boolean>(false)
   const [error, setError] = useState<Error | null>(null)
   const [downloadURL, setDownloadURL] = useState<string | null>(null)

   useEffect(() => {
      // Reset state when path changes
      setUploadProgress(0)
      setIsUploading(false)
      setError(null)
      setDownloadURL(null)
   }, [path])

   const uploadFile = useCallback(
      (file: File, fileName: string): Promise<string> => {
         return new Promise<string>((resolve, reject) => {
            const fullPath = `${path}/${fileName}`
            const storageRef = FirebaseInstance.storage().ref(fullPath)
            const uploadTask = storageRef.put(file)

            setIsUploading(true)

            uploadTask.on(
               "state_changed",
               (snapshot) => {
                  const progress =
                     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  setUploadProgress(progress)
               },
               (error) => {
                  setIsUploading(false)
                  setError(error)
                  reject(error)
                  if (onError) {
                     onError(error)
                  }
               },
               async () => {
                  setIsUploading(false)
                  setUploadProgress(100)
                  const downloadURL =
                     await uploadTask.snapshot.ref.getDownloadURL()
                  resolve(downloadURL)
               }
            )
         })
      },
      [path, onError]
   )

   return [uploadFile, uploadProgress, isUploading, error, downloadURL]
}

export default useFirebaseUpload
