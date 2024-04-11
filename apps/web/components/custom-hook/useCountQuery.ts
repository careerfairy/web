import { getCountFromServer, Query } from "@firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

export type CountQuery = {
   loading: boolean
   count: number | null
   error: Error | undefined
}
/**
 * Count documents in a query
 *
 * Uses the new fistore getCountFromServer() feature
 */
const useCountQuery = (q: Query): CountQuery => {
   const [count, setCount] = useState<number | null>(null)
   const [error, setError] = useState<Error | undefined>(undefined)

   useEffect(() => {
      if (!q) {
         return
      }
      let mounted = true

      getCountFromServer(q)
         .then((r) => {
            if (mounted) {
               setCount(r.data().count)
            }
         })
         .catch((e) => {
            errorLogAndNotify(e)
            setError(e)
         })

      return () => {
         mounted = false
      }
   }, [q])

   return useMemo(() => {
      return {
         loading: count === null,
         count,
         error,
      }
   }, [count, error])
}

export default useCountQuery
