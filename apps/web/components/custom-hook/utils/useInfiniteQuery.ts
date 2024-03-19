import {
   Query,
   QueryDocumentSnapshot,
   getDocs,
   limit,
   query,
   startAfter,
} from "firebase/firestore"
import { useMemo } from "react"
import useSWRInfinite from "swr/infinite"

type Key<T> = [
   pageIndex: number,
   previousPageData: QueryDocumentSnapshot<T>[] | null
]

const fetchUsers = async <T>(
   key: Key<T>,
   baseQuery: Query<T>,
   options?: Options
): Promise<QueryDocumentSnapshot<T>[]> => {
   const [pageIndex, previousPageData] = key
   if (previousPageData && !previousPageData.length) return []

   let q = query(baseQuery, limit(options.limit))

   if (pageIndex !== 0 && previousPageData) {
      const lastDoc = previousPageData[previousPageData.length - 1]
      q = query(q, startAfter(lastDoc))
   }

   const documentSnapshots = await getDocs(q)

   return documentSnapshots.docs
}

const getKey = <T>(
   pageIndex: number,
   previousPageData: QueryDocumentSnapshot<T>[] | null
): Key<T> | null => {
   if (previousPageData && !previousPageData.length) return null
   return [pageIndex, previousPageData] as const
}

type Options = {
   limit: number
}

type UseInfiniteQuery<T> = {
   data: T[]
   error: Error
   isLoadingMore: boolean
   page: number
   loadMore: () => void
   refetch: () => void
}

export const useInfiniteQuery = <T>(
   query: Query<T>,
   options?: Options
): UseInfiniteQuery<T> => {
   const { data, error, size, setSize, mutate } = useSWRInfinite(
      getKey,
      (key: Key<T>) => fetchUsers(key, query, options),
      { initialSize: 1 }
   )

   const isLoadingInitialData = !data && !error
   const isLoadingMore =
      isLoadingInitialData ||
      (size > 0 && data && typeof data[size - 1] === "undefined")

   return useMemo(
      () => ({
         data: data?.flatMap((doc) => doc.map((d) => d.data())) ?? [],
         error,
         isLoadingMore,
         page: size,
         loadMore: () => setSize(size + 1),
         refetch: () => mutate(),
      }),
      [data, error, isLoadingMore, size, setSize, mutate]
   )
}
