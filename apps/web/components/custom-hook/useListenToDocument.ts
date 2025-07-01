import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore"
import { useEffect, useState } from "react"
import { usePreviousDistinct } from "react-use"
import { Identifiable } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"

export type UseListenToDocumentReturn<TData> = {
   /** Document data. `null` if document doesn't exist, `undefined` if not yet fetched. */
   data: TData | undefined | null
   /** True while waiting for initial server response. */
   loading: boolean
   /** Error from fetch/listen operations. */
   error: Error | null
}

/**
 * React hook that listens to a Firestore document in real‑time.
 *
 * ```tsx
 * Example:
 * const { data: profile, loading, error } = useListenToDocument<UserProfile>(`users/${uid}`);
 * ```
 *
 * @typeParam TData Inferred from `docPath`, otherwise defaults to Identifiable.
 * @param docPath Document path string.
 */
export function useListenToDocument<TData extends Identifiable = Identifiable>(
   docPath: string | null
): UseListenToDocumentReturn<TData> {
   const [data, setData] = useState<TData | undefined>(undefined)
   const [loading, setLoading] = useState<boolean>(docPath ? true : false)
   const [error, setError] = useState<Error | null>(null)

   const prevDocPath = usePreviousDistinct(docPath)

   /**
    * Reset state when docPath changes
    */
   useEffect(() => {
      if (prevDocPath !== docPath) {
         setData(undefined)
         setLoading(true)
         setError(null)
      }
   }, [docPath, prevDocPath])

   /**
    * Listen to the document
    */
   useEffect(() => {
      if (!docPath) return

      let unsubscribe: Unsubscribe | undefined

      // Resolve the DocumentReference
      const docRef = doc(FirestoreInstance, docPath).withConverter(
         createGenericConverter<TData>()
      )

      async function init() {
         try {
            unsubscribe = onSnapshot(
               docRef,
               (snap) => {
                  const raw = snap.exists() ? snap.data() : null
                  setData(raw)
                  setLoading(false)
               },
               (err) => {
                  errorLogAndNotify(err, {
                     title: "useListenToDocument error",
                     message: "Error listening to document",
                  })
                  setError(err)
                  setLoading(false)
               }
            )
         } catch (err) {
            setError(err as Error)
            setLoading(false)
         }
      }

      init()

      // Cleanup on unmount or docPath change
      return () => {
         unsubscribe?.()
         setLoading(false)
         setError(null)
         setData(undefined)
      }
   }, [docPath])

   if (!docPath) {
      return {
         data: null,
         loading: false,
         error: null,
      }
   }

   return { data, loading, error }
}
