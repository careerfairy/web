import {
   limit,
   query,
   Query,
   startAfter,
   getDocs,
   OrderByDirection,
   FirestoreDataConverter,
} from "@firebase/firestore"
import { orderBy } from "firebase/firestore"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Identifiable } from "@careerfairy/shared-lib/commonTypes"

export interface UseInfiniteCollection<T> {
   query: Query<T>
   limit: number
   orderBy: OrderBy<T>
   converterFn?: FirestoreDataConverter<T>
   initialData?: T[]
}

interface OrderBy<T> {
   field: keyof T & string
   direction: OrderByDirection
}

export interface InfiniteCollection<T extends Identifiable> {
   getMore(): Promise<void>
   loading: boolean
   data?: T[]
   limit: number
   hasMore: boolean
   error?: Error
}

const useInfiniteCollection = <T extends Identifiable>(
   options: UseInfiniteCollection<T>
): InfiniteCollection<T> => {
   const internalLimit = options.limit
   const [docs, setDocs] = useState<T[]>(options.initialData || [])
   const [loading, setLoading] = useState(false)
   const [hasMore, setHasMore] = useState(true)
   const [error, setError] = useState<Error>()

   const order = useMemo(
      () => orderBy(options.orderBy.field, options.orderBy.direction),
      [options.orderBy.direction, options.orderBy.field]
   )

   const [q, setQuery] = useState(
      query(options.query, order, limit(internalLimit))
   )

   const fetchDocuments = useCallback(
      async (queryToFetch: Query<T>) => {
         const converterFn = options.converterFn || createGenericConverter<T>()

         setLoading(true)
         setError(undefined)
         try {
            const snapshot = await getDocs(
               queryToFetch.withConverter(converterFn)
            )
            const fetchedDocs = snapshot.docs.map((doc) => doc.data())
            setDocs((prevDocs) => [...prevDocs, ...fetchedDocs])
            setHasMore(fetchedDocs.length >= internalLimit)
         } catch (error) {
            setError(error)
         } finally {
            setLoading(false)
         }
      },
      [internalLimit, options.converterFn]
   )

   const getMore = useCallback(async () => {
      if (!hasMore) return

      const lastDoc = docs[docs.length - 1]

      if (!lastDoc) return

      const nextQuery = query(
         options.query,
         order,
         limit(internalLimit),
         startAfter(lastDoc)
      )

      await fetchDocuments(nextQuery)
      setQuery(nextQuery)
   }, [options.query, order, internalLimit, docs, fetchDocuments, hasMore])

   useEffect(() => {
      if (options.initialData) return

      void fetchDocuments(q)
   }, [q, fetchDocuments, options.initialData])

   return {
      getMore,
      loading,
      data: docs,
      limit: options.limit,
      hasMore,
      error,
   }
}

export default useInfiniteCollection
