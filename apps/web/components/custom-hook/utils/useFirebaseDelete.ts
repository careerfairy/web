import { useState, useCallback } from "react"
import FirebaseInstance from "../../../data/firebase/FirebaseInstance"

/**
 * UseFirebaseDeleteReturnType:
 * - deleteFiles: Function to delete multiple files using their provided URLs
 * - isDeleting: State variable that denotes whether deletion is currently in progress
 * - errors: Stores the Errors that occurred during deletion (if any)
 */
type UseFirebaseDeleteReturnType = [
   (urls: string[]) => Promise<void>, // Function to delete multiple files
   boolean, // Whether deletion is currently in progress
   Error[] | null // Errors that occurred during deletion (if any)
]

/**
 * useFirebaseDelete is a custom hook for deleting files from Firebase Storage
 * @param onError (optional) a callback function that will be called with the error object if an error occurs during deletion
 * @returns a tuple containing the deleteFiles function, deletion status, and errors (if any).
 *
 * @example
 * // Usage:
 * const [deleteFiles, isDeleting, errors] = useFirebaseDelete();
 * // To delete files:
 * deleteFiles(["urlToYourFile1", "urlToYourFile2"]);
 */
const useFirebaseDelete = (
   onError?: (error: Error) => void
): UseFirebaseDeleteReturnType => {
   const [isDeleting, setIsDeleting] = useState<boolean>(false)
   const [errors, setErrors] = useState<Error[] | null>(null)

   const deleteFiles = useCallback(
      async (urls: string[]): Promise<void> => {
         setIsDeleting(true)
         const deletions = urls.map((url) => {
            return new Promise((resolve, reject) => {
               try {
                  const storageRef = FirebaseInstance.storage().refFromURL(url)
                  storageRef.delete().then(resolve).catch(reject)
               } catch (error) {
                  reject(error)
               }
            })
         })

         try {
            const results = await Promise.allSettled(deletions)
            const newErrors = results
               .filter(
                  (result): result is PromiseRejectedResult =>
                     result.status === "rejected"
               )
               .map((result) => result.reason as Error)
            if (newErrors.length > 0) {
               setErrors(newErrors)
               if (onError) {
                  newErrors.forEach((error) => onError(error))
               }
            }
         } finally {
            setIsDeleting(false)
         }
      },
      [onError]
   )

   return [deleteFiles, isDeleting, errors]
}

export default useFirebaseDelete
