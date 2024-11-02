import { doc, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

/**
 * Hook to check if a live stream is a draft in real-time.
 * @param {string} livestreamId - The ID of the live stream to check if it is a draft.
 * @returns {boolean} - Whether the live stream is a draft or not.
 */
export const useIsDraftLivestreams = (livestreamId: string): boolean => {
   const firestore = useFirestore()
   const [isDraft, setIsDraft] = useState(true)

   useEffect(() => {
      const unsubscribe = onSnapshot(
         doc(firestore, "draftLivestreams", livestreamId),
         (doc) => {
            setIsDraft(Boolean(doc.data()))
         }
      )

      return () => {
         setIsDraft(true)
         unsubscribe()
      }
   }, [livestreamId, firestore])

   return isDraft
}
