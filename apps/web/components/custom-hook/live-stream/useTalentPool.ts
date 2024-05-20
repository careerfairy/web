import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
import { useUserLivestreamData } from "../streaming/useUserLivestreamData"


/**
 * A hook for joining and leaving a live stream talent pool. This hook replaces the outdated 
 * custom-hook/useJoinTalentPool, using the userLivestreamData to fetch the talent pool data. 
 * The companyId is still being used here for backwards compatibility, but it is not put to use anywhere.
 * @param livestream 
 * @returns An object with handlers and information on the operation
 */
const useTalentPool = (livestream) => {
   const {
      push,
      asPath,
   } = useRouter()
   const { userData, isLoggedOut } = useAuth()
   const dispatch = useDispatch()
   const {
      joinCompanyTalentPool,
      leaveCompanyTalentPool,
   } = useFirebaseService()
   
   const [loading, setLoading] = useState(false)

   const {data: userLivestreamData} = useUserLivestreamData(livestream.id, userData.id)

   const userIsInTalentPool = Boolean(userLivestreamData?.talentPool?.date)

   const handlers = useMemo(
      () => ({
         joinTalentPool: async () => {
            try {
               if (isLoggedOut) {
                  dataLayerLivestreamEvent(
                     "talent_pool_join_login",
                     livestream
                  )
                  return push({
                     query: { absolutePath: asPath },
                     pathname: "/login",
                  })
               }
               setLoading(true)
               const companyId = livestream.companyId
               await joinCompanyTalentPool(
                  companyId,
                  userData,
                  livestream
               )
               dataLayerLivestreamEvent("talent_pool_joined", livestream)
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            }
            setLoading(false)
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

               await leaveCompanyTalentPool(
                  companyId,
                  userData,
                  livestream
               )
               dataLayerLivestreamEvent("talent_pool_leave", livestream)
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            }
            setLoading(false)
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
         isLoggedOut
      ]
   )



   return { handlers, userIsInTalentPool, loading }
}

export default useTalentPool
