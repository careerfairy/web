import {
   documentId,
   getDocs,
   limit,
   Query,
   query as firestoreQuery, // renamed
   QueryDocumentSnapshot,
   startAfter,
   where,
   collection,
} from "@firebase/firestore"
import { useCallback, useEffect, useState } from "react"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"

export interface UseInfiniteCollection<T> {
   query: Query<T>
   limit: number
   initialData?: T[]
}

export interface InfiniteCollection<T extends Identifiable> {
   getMore(): Promise<void>
   loading: boolean
   documents?: T[]
   limit: number
   hasMore: boolean
   error?: Error
}

const useInfiniteCollection = <T extends Identifiable>({
   query: initialQuery, // renamed
   limit: initialLimit, // renamed
   initialData = [],
}: UseInfiniteCollection<T>): InfiniteCollection<T> => {
   const [docs, setDocs] = useState<T[]>(initialData)
   const [lastDocumentSnapShot, setLastDocumentSnapShot] =
      useState<QueryDocumentSnapshot>()
   const [loading, setLoading] = useState(false)
   const [hasMore, setHasMore] = useState(true)
   const [error, setError] = useState<Error>()

   const fetchDocuments = useCallback(
      async (lastSnap?: QueryDocumentSnapshot) => {
         setLoading(true)
         setError(undefined)
         try {
            const nextQuery = firestoreQuery(
               initialQuery,
               limit(initialLimit),
               ...(lastSnap ? [startAfter(lastSnap)] : [])
            )
            const snapshot = await getDocs(nextQuery)
            const fetchedDocs = snapshot.docs.map((doc) => doc.data())

            setDocs((prevDocs) => [...prevDocs, ...fetchedDocs])
            setHasMore(fetchedDocs.length >= initialLimit)
            setLastDocumentSnapShot(snapshot.docs[snapshot.docs.length - 1])
         } catch (error) {
            setError(error)
         } finally {
            setLoading(false)
         }
      },
      [initialLimit, initialQuery]
   )

   const getMore = useCallback(async () => {
      if (!hasMore) return

      // Get the last document from the current documents.
      const lastDoc = docs[docs.length - 1]

      if (!lastDoc) return

      await fetchDocuments(lastDocumentSnapShot)
   }, [hasMore, docs, fetchDocuments, lastDocumentSnapShot])

   const getInitialDataLastDoc = useCallback(async () => {
      const lastDoc = initialData[initialData.length - 1]
      const id = lastDoc?.id

      if (!id) return

      // @ts-ignore
      const collectionNameSegments = initialQuery._query.path
         .segments as string[]

      const collectionName =
         collectionNameSegments[collectionNameSegments.length - 1]

      if (!collectionName) return

      const collectionRef = collection(FirestoreInstance, collectionName)
      const docs = await getDocs(
         firestoreQuery(collectionRef, where(documentId(), "==", id), limit(1))
      )
      const lastSnap = docs.docs[0] || undefined
      setLastDocumentSnapShot(lastSnap)
   }, [initialData, initialQuery])

   const hasInitialData = Boolean(initialData.length)

   useEffect(() => {
      if (hasInitialData) {
         void getInitialDataLastDoc()
      } else {
         void fetchDocuments()
      }
   }, [fetchDocuments, getInitialDataLastDoc, hasInitialData])

   return {
      getMore,
      loading,
      documents: docs,
      limit: initialLimit,
      hasMore,
      error,
   }
}

export default useInfiniteCollection
