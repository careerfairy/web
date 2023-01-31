import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useAuth } from "../../HOCs/AuthProvider"
import { useCurrentStream } from "../../context/stream/StreamContext"
import { useDispatch } from "react-redux"
import * as actions from "../../store/actions"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"

const useJoinTalentPool = () => {
   const {
      query: { livestreamId },
      push,
      asPath,
   } = useRouter()
   const { userData } = useAuth()
   const dispatch = useDispatch()
   const {
      listenToUserInTalentPool,
      getLivestreamCompanyId,
      joinCompanyTalentPool,
      leaveCompanyTalentPool,
   } = useFirebaseService()
   const { isBreakout, currentLivestream } = useCurrentStream()
   const [userIsInTalentPool, setUserIsInTalentPool] = useState(false)
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      if (!isBreakout) {
         if (
            userData?.talentPools &&
            currentLivestream &&
            userData.talentPools.indexOf(currentLivestream.companyId) > -1
         ) {
            setUserIsInTalentPool(true)
         } else {
            setUserIsInTalentPool(false)
         }
      } else if (livestreamId && userData?.userEmail) {
         const unsubscribe = listenToUserInTalentPool(
            livestreamId as string,
            userData.userEmail,
            (querySnapshot) => {
               setUserIsInTalentPool(querySnapshot.exists)
            }
         )
         return () => unsubscribe()
      } else {
         setUserIsInTalentPool(false)
      }
   }, [
      livestreamId,
      userData?.userEmail,
      userData,
      isBreakout,
      userData?.talentPools,
      currentLivestream?.companyId,
   ])

   const handlers = useMemo(
      () => ({
         joinTalentPool: async () => {
            try {
               if (!userData) {
                  dataLayerLivestreamEvent(
                     "talent_pool_join_login",
                     currentLivestream
                  )
                  return push({
                     query: { absolutePath: asPath },
                     pathname: "/login",
                  })
               }
               setLoading(true)
               const companyId = await getCompanyId(
                  isBreakout,
                  livestreamId,
                  currentLivestream
               )
               await joinCompanyTalentPool(
                  companyId,
                  userData,
                  currentLivestream
               )
               dataLayerLivestreamEvent("talent_pool_joined", currentLivestream)
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            }
            setLoading(false)
         },
         leaveTalentPool: async () => {
            try {
               if (!userData) {
                  return push({
                     query: { absolutePath: asPath },
                     pathname: "/login",
                  })
               }
               setLoading(true)
               const companyId = await getCompanyId(
                  isBreakout,
                  livestreamId,
                  currentLivestream
               )

               await leaveCompanyTalentPool(
                  companyId,
                  userData,
                  currentLivestream
               )
               dataLayerLivestreamEvent("talent_pool_leave", currentLivestream)
            } catch (e) {
               dispatch(actions.sendGeneralError(e))
            }
            setLoading(false)
         },
      }),
      [
         livestreamId,
         userData,
         loading,
         asPath,
         isBreakout,
         currentLivestream.companyId,
         currentLivestream.title,
         dispatch,
         joinCompanyTalentPool,
         leaveCompanyTalentPool,
         push,
      ]
   )

   const getCompanyId = useCallback(
      async (isBreakout, livestreamId, currentLivestream) => {
         let companyId: string
         if (isBreakout) {
            companyId = await getLivestreamCompanyId(livestreamId)
         } else {
            companyId = currentLivestream.companyId
         }
         return companyId
      },
      [getLivestreamCompanyId]
   )

   return { handlers, userIsInTalentPool, loading }
}

export default useJoinTalentPool
