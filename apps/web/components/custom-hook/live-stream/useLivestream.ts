import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useMemo } from "react"
import { ReactFireOptions } from "reactfire"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

/**
 * Custom hook to get a livestream from the database
 **/
const useLivestream = (livestreamId: string, initialData?: LivestreamEvent) => {
   const options = useMemo(() => {
      const opts: ReactFireOptions = {
         idField: "id",
         suspense: false,
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

   return useFirestoreDocument<LivestreamEvent>(
      "livestreams",
      [livestreamId],
      options
   )
}

export default useLivestream
