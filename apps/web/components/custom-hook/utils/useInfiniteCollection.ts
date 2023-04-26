import {
   documentId,
   getDocs,
   limit,
   Query,
   query as firestoreQuery,
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
   hasMore: boolean
   error?: Error
}

const useInfiniteCollection = <T extends Identifiable>(
   options: UseInfiniteCollection<T>
): InfiniteCollection<T> => {
   const [docs, setDocs] = useState<T[]>(options.initialData || [])
   const [lastDocumentSnapShot, setLastDocumentSnapShot] =
      useState<QueryDocumentSnapshot>()
   const [loading, setLoading] = useState(false)
   const [hasMore, setHasMore] = useState(true)
   const [error, setError] = useState<Error>()

   const [initialDataLoaded, setInitialDataLoaded] = useState(
      !options.initialData // If there is no initial data, then we don't need to wait for it to load
   )

   const fetchDocuments = useCallback(
      async (lastSnap?: QueryDocumentSnapshot) => {
         setLoading(true)
         setError(undefined)
         try {
            const nextQuery = firestoreQuery(
               options.query,
               ...(lastSnap ? [startAfter(lastSnap)] : [])
            )
            const snapshot = await getDocs(nextQuery)
            const fetchedDocs = snapshot.docs.map((doc) => doc.data())

            setDocs((prevDocs) => [...prevDocs, ...fetchedDocs])
            setHasMore(fetchedDocs.length >= options.limit)
            setLastDocumentSnapShot(snapshot.docs[snapshot.docs.length - 1])
         } catch (error) {
            setError(error)
         } finally {
            setLoading(false)
         }
      },
      [options.limit, options.query]
   )

   const getMore = useCallback(async () => {
      if (!hasMore || !initialDataLoaded) return

      // Get the last document from the current documents.
      const lastDoc = docs[docs.length - 1]

      if (!lastDoc) return

      await fetchDocuments(lastDocumentSnapShot)
   }, [hasMore, initialDataLoaded, docs, fetchDocuments, lastDocumentSnapShot])

   /*
    * This method is used to get the last document snapshot from the initial data
    * This is because in order to paginate a query, we need a document snapshot, not the doc data itself
    * */
   const getInitialDataLastDocSnapshot = useCallback(async () => {
      const initialData = options.initialData || []
      const lastDoc = initialData[initialData.length - 1]
      const id = lastDoc?.id

      if (!id) return

      // @ts-ignore
      const collectionNameSegments = options.query._query.path
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
      setInitialDataLoaded(true) // Set initialDataLoaded to true here
   }, [options.initialData, options.query])

   const hasInitialData = Boolean(options.initialData.length)

   useEffect(() => {
      if (hasInitialData) {
         void getInitialDataLastDocSnapshot()
      } else {
         void fetchDocuments()
      }
   }, [fetchDocuments, getInitialDataLastDocSnapshot, hasInitialData])

   return {
      getMore,
      loading,
      documents: docs,
      hasMore,
      error,
   }
}

export default useInfiniteCollection
