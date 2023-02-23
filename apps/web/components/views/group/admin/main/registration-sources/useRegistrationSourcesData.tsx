import {
   GetRegistrationSourcesFnArgs,
   registrationSourcesCacheKey,
   RegistrationSourcesResponseItem,
} from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import useStaleWhileRevalidate from "components/custom-hook/utils/useStaleWhileRevalidate"
import { firebaseServiceInstance } from "data/firebase/FirebaseService"
import { useCallback, useMemo } from "react"

/**
 * Fetches cached data first
 *
 * If no livestream id is passed, we assume that we need to fech all livestreams
 */
export const useRegistrationSourcesData = (
   groupId: string,
   livestreamId?: string
) => {
   const args = useMemo(() => {
      const args: GetRegistrationSourcesFnArgs = {
         groupId,
      }

      if (livestreamId) {
         args.livestreamIds = [livestreamId]
      } else {
         args.fetchType = "ALL_LIVESTREAMS"
      }

      return args
   }, [groupId, livestreamId])

   const functionCall = useCallback(() => {
      return firebaseServiceInstance
         .getRegistrationSources(args)
         .then((r) => r.data)
   }, [args])

   const cacheKeyValues = useMemo(
      () => registrationSourcesCacheKey(args),
      [args]
   )

   const data = useStaleWhileRevalidate<RegistrationSourcesResponseItem[]>(
      "analytics",
      cacheKeyValues,
      functionCall
   )

   return data
}
