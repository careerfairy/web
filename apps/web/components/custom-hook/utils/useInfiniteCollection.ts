import {
   getDocs,
   Query,
   query as firestoreQuery,
   QueryDocumentSnapshot,
   startAfter,
   collection,
   limit,
} from "@firebase/firestore"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { doc, getDoc } from "firebase/firestore"

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
   handleClientSideUpdate: (docId: string, updateData: Partial<T>) => void
   getAll: () => Promise<void>
   query: Query<T>
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
      !options.initialData?.length // If there is no initial data, then we don't need to wait for it to load
   )

   const queryWithLimit = useMemo(
      () => firestoreQuery(options.query, limit(options.limit)),
      [options.query, options.limit]
   )

   const fetchDocuments = useCallback(
      async (lastSnap?: QueryDocumentSnapshot) => {
         setLoading(true)
         setError(undefined)
         try {
            const nextQuery = firestoreQuery(
               queryWithLimit,
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
      [options.limit, queryWithLimit]
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
      const collectionNameSegments = queryWithLimit._query.path
         .segments as string[]

      const collectionName =
         collectionNameSegments[collectionNameSegments.length - 1]

      if (!collectionName) return

      const collectionRef = collection(FirestoreInstance, collectionName)
      const docRef = doc(collectionRef, id)
      const lastDocSnap = await getDoc(docRef)
      if (lastDocSnap.exists()) {
         // const lastSnap = docs.docs[0] || undefined
         setLastDocumentSnapShot(lastDocSnap)
      }
      setInitialDataLoaded(true) // Set initialDataLoaded to true here
   }, [options.initialData, queryWithLimit])

   const getAll = useCallback(async () => {
      // If the initial data has not been loaded, don't proceed.
      if (!initialDataLoaded) return

      setLoading(true)
      setError(undefined)
      try {
         const snapshot = await getDocs(options.query)
         const fetchedDocs = snapshot.docs.map((doc) => doc.data())

         setDocs(fetchedDocs)
         setHasMore(false)
         setLastDocumentSnapShot(snapshot.docs[snapshot.docs.length - 1])
      } catch (error) {
         setError(error)
      } finally {
         setLoading(false)
      }
   }, [initialDataLoaded, options.query])

   const handleClientSideUpdate = useCallback(
      (docId: string, updateData: Partial<T>) => {
         setDocs((prevDocs) =>
            prevDocs.map((doc) =>
               doc.id === docId ? { ...doc, ...updateData } : doc
            )
         )
      },
      []
   )

   const hasInitialData = Boolean(options.initialData?.length)

   useEffect(() => {
      if (!hasMore) return

      if (hasInitialData) {
         void getInitialDataLastDocSnapshot()
      } else {
         void fetchDocuments()
      }
   }, [fetchDocuments, getInitialDataLastDocSnapshot, hasInitialData, hasMore])

   return {
      getMore,
      loading,
      documents: docs,
      hasMore,
      error,
      handleClientSideUpdate,
      getAll,
      query: options.query,
   }
}

export default useInfiniteCollection
