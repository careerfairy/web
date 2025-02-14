import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useUserLivestreamData } from "../streaming/useUserLivestreamData"

/**
 * A hook for joining and leaving a live stream talent pool. This hook replaces the outdated
 * custom-hook/useJoinTalentPool, using the userLivestreamData to fetch the talent pool data.
 * The companyId is still being used here for backwards compatibility, but it is not put to use anywhere.
 * @param livestream
 * @returns An object with handlers and information on the operation
 */
const useTalentPool = (livestream: LivestreamEvent) => {
   const { push, asPath } = useRouter()
   const { userData, isLoggedOut } = useAuth()
   const dispatch = useDispatch()
   const { joinCompanyTalentPool, leaveCompanyTalentPool } =
      useFirebaseService()

   const [loading, setLoading] = useState(false)

   const { data: userLivestreamData } = useUserLivestreamData(
      livestream.id,
      userData.id
   )

   const userIsInTalentPool = Boolean(userLivestreamData?.talentPool?.date)

   const handlers = useMemo(
      () => ({
         joinTalentPool: async () => {
            try {
               if (isLoggedOut) {
                  dataLayerLivestreamEvent(
                     AnalyticsEvents.TalentPoolJoinLogin,
                     livestream
                  )
                  return push({
                     query: { absolutePath: asPath },
                     pathname: "/login",
                  })
               }
               setLoading(true)
               const companyId = livestream.companyId
               await joinCompanyTalentPool(companyId, userData, livestream)

               dataLayerLivestreamEvent(
                  AnalyticsEvents.TalentPoolJoined,
                  livestream,
                  {
                     companyIds: livestream.groupIds,
                  }
               )
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            } finally {
               setLoading(false)
            }
         },
         leaveTalentPool: async () => {
            try {
               if (isLoggedOut) {
                  return push({
                     query: { absolutePath: asPath },
                     pathname: "/login",
                  })
               }
               setLoading(true)
               const companyId = livestream.companyId

               await leaveCompanyTalentPool(companyId, userData, livestream)

               if (livestream.groupIds) {
                  livestream.groupIds.forEach((companyId) => {
                     dataLayerLivestreamEvent(
                        AnalyticsEvents.TalentPoolLeave,
                        livestream,
                        {
                           companyId,
                        }
                     )
                  })
               }
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            } finally {
               setLoading(false)
            }
         },
      }),
      [
         userData,
         asPath,
         dispatch,
         joinCompanyTalentPool,
         leaveCompanyTalentPool,
         push,
         livestream,
         isLoggedOut,
      ]
   )

   return { handlers, userIsInTalentPool, loading }
}

export default useTalentPool
