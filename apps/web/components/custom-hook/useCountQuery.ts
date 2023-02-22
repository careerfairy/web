import { getCountFromServer, Query } from "@firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Count documents in a query
 *
 * Uses the new fistore getCountFromServer() feature
 */
const useCountQuery = (q: Query) => {
   const [count, setCount] = useState<number | null>(null)
   const [error, setError] = useState<Error | undefined>(undefined)

   useEffect(() => {
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

   const values = useMemo(() => {
      return {
         loading: count === null,
         count,
         error,
      }
   }, [count, error])

   return values
}

export default useCountQuery
