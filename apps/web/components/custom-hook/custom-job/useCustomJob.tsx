import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useMemo } from "react"
import { ReactFireOptions } from "reactfire"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

type Options = {
   initialData?: CustomJob
}

/**
 * Fetch Custom Jobs
 *
 * @param jobId
 */
const useCustomJob = (jobId: string, options?: Options) => {
   const { initialData } = options || {}

   const reactFireOptions = useMemo(() => {
      const opts: ReactFireOptions = {
         idField: "id",
      }

      /**
       * Conditionally add initialData to the options if truthy
       * if it exists, reactfire returns it immediately
       *
       * This is required because if we pass undefined, reactfire will return undefined
       */
      if (initialData) {
         opts.initialData = initialData
      }

      return opts
   }, [initialData])

   const { data } = useFirestoreDocument<CustomJob>(
      "customJobs",
      [jobId],
      reactFireOptions
   )

   return data
}

export default useCustomJob
