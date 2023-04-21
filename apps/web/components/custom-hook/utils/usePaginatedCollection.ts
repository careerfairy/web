import {
   DocumentData,
   endBefore,
   limit,
   limitToLast,
   OrderByDirection,
   query,
   Query,
   startAfter,
} from "@firebase/firestore"
import { orderBy } from "firebase/firestore"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ObservableStatus, useFirestoreCollection } from "reactfire"
import useCountQuery, { CountQuery } from "../useCountQuery"

export interface UsePaginatedCollection<T> {
   query: Query<T>
   limit: number
   orderBy: OrderBy<T>
   getTotalCount?: boolean
}

interface OrderBy<T> {
   field: keyof T & string
   direction: OrderByDirection
}

export interface PaginatedCollection<T = DocumentData> {
   prevDisabled: boolean
   nextDisabled: boolean
   prev(): void
   next(): void
   cursor: number
   page: number
   loading: boolean
   status: ObservableStatus<T>["status"]
   data?: T[]
   error?: ObservableStatus<T>["error"]
   limit: number
   countQueryResponse?: CountQuery
   /*
    * The full query without pagination
    * */
   fullQuery: Query<T>
}

/**
 * Retrieves a firestore collection with pagination controls
 * limit and orderBy fields are required for this operation
 *
 * Initially taken from https://github.com/FirebaseExtended/reactfire/discussions/472
 * But changed to request limit + 1 and check before hand if we have a next page
 *
 * @param options requires {@link UsePaginatedCollection} (query, limit, and order)
 * @returns
 */
const usePaginatedCollection = <T = DocumentData>(
   options: UsePaginatedCollection<T>
): PaginatedCollection<T> => {
   const internalLimit = options.limit + 1 // +1 to check if there is another page
   const [cursor, setCursor] = useState(0)
   const [prevNavigation, setPrevNavigation] = useState(false) // track when the user navigates back

   // eslint-disable-next-line react/hook-use-state
   const order = useMemo(
      () => orderBy(options.orderBy.field, options.orderBy.direction),
      [options.orderBy.direction, options.orderBy.field]
   )

   // eslint-disable-next-line react/hook-use-state
   const [q, setQuery] = useState(
      query(options.query, order, limit(internalLimit))
   )

   const fullQuery = useMemo(
      () => query(options.query, order),
      [options.query, order]
   )

   const countQueryResponse = useCountQuery(
      options.getTotalCount ? fullQuery : null
   )

   const result = useFirestoreCollection(q, reactfireOptions)
   const prevDisabled = cursor === 0
   const nextDisabled =
      !prevNavigation && (result.data?.size ?? 0) < internalLimit

   const prev = useCallback(() => {
      const prevCursor = result.data?.docs[0]
      if (prevDisabled || !prevCursor) return

      const q = query(
         options.query,
         order,
         limitToLast(options.limit),
         endBefore(prevCursor)
      )

      setQuery(q)
      setCursor((state) => state - 1)
      setPrevNavigation(true)
   }, [options.limit, options.query, order, prevDisabled, result.data?.docs])

   const next = useCallback(() => {
      const offset = result.data?.size === internalLimit ? 2 : 1
      const nextCursor = result.data?.docs[result.data?.size - offset]
      if (nextDisabled || !nextCursor) return

      const q = query(
         options.query,
         order,
         limit(internalLimit),
         startAfter(nextCursor)
      )

      setQuery(q)
      setCursor((state) => state + 1)
      setPrevNavigation(false)
   }, [
      internalLimit,
      nextDisabled,
      options.query,
      order,
      result.data?.docs,
      result.data?.size,
   ])

   // Reset the cursor pagination when the options change for better UX
   const reset = useCallback(() => {
      setCursor(0)
      setPrevNavigation(false)
   }, [])

   useEffect(() => {
      // Update the query when the options change
      setQuery(query(options.query, order, limit(internalLimit)))
      reset()
   }, [options.query, order, internalLimit, reset])

   // remove the extra element if required
   let data = result.data?.docs?.map((d) => ({ ...d.data(), id: d.id }))
   if (data?.length > options.limit) {
      data = data?.slice(0, -1)
   }

   return {
      prevDisabled,
      nextDisabled,
      prev,
      next,
      cursor,
      limit: options.limit,
      loading: result.status === "loading",
      status: result.status,
      data,
      page: cursor + 1,
      countQueryResponse,
      fullQuery,
   }
}

const reactfireOptions = { suspense: false, idField: "id" }

export default usePaginatedCollection
