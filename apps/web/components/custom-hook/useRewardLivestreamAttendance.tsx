import { useEffect } from "react"
import { useLocalStorage, useSessionStorage } from "react-use"
import {
   localStorageInvite,
   localStorageReferralCode,
} from "../../constants/localStorageKeys"
import * as Sentry from "@sentry/nextjs"
import { REWARD_LIVESTREAM_ATTENDANCE_SECONDS } from "@careerfairy/shared-lib/dist/rewards"
import { useAuth } from "../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { rewardService } from "data/firebase/RewardService"

const useRewardLivestreamAttendance = (livestreamData: LivestreamEvent) => {
   const { isLoggedIn } = useAuth()
   const [invite] = useLocalStorage(localStorageInvite, null, { raw: true })
   const [referralCode] = useLocalStorage(localStorageReferralCode, "", {
      raw: true,
   })
   const [started, setStarted] = useSessionStorage(
      "livestreamAttendanceStarted"
   )
   const [alreadyRewarded, setAlreadyRewarded] = useSessionStorage(
      "livestreamAttendanceRewarded"
   )

   const mainStreamId = livestreamData?.parentLivestream
      ? livestreamData.parentLivestream?.id
      : livestreamData?.id

   useEffect(() => {
      if (
         !livestreamData ||
         !livestreamData?.hasStarted ||
         livestreamData?.hasEnded ||
         !mainStreamId // We don't want to reward the attendance if there is no main stream to begin with
      ) {
         return // do nothing, the current stream you're in is not live
      }

      if (!isLoggedIn) {
         return // do nothing, no user to reward
      }

      const isInvitation = invite && referralCode && invite !== mainStreamId

      if (alreadyRewarded === mainStreamId) {
         return // do nothing, user already has been rewarded
      }

      try {
         let seconds = REWARD_LIVESTREAM_ATTENDANCE_SECONDS
         if (started) {
            const diffSeconds =
               (Date.now() - parseInt(started as string)) / 1000
            seconds = Math.round(seconds - diffSeconds)
         } else {
            setStarted(Date.now())
         }

         if (seconds <= 0) {
            reward(isInvitation)
         } else {
            const interval = setTimeout(() => {
               reward(isInvitation)
            }, seconds * 1000)

            return () => {
               clearTimeout(interval)
            }
         }
      } catch (e) {
         Sentry.captureException(e)
         console.error(e)
      }
   }, [
      isLoggedIn,
      livestreamData?.hasStarted,
      started,
      alreadyRewarded,
      invite,
      referralCode,
      mainStreamId,
   ])

   const reward = (isInvitation: boolean) => {
      setAlreadyRewarded(mainStreamId)
      setStarted(null)

      rewardService
         .userAction("LIVESTREAM_USER_ATTENDED", mainStreamId)
         .then(() => {
            console.log("User Attendance rewarded!")
         })
         .catch((e) => {
            console.error(e)
         })

      if (isInvitation) {
         rewardService
            .livestreamAttendance(mainStreamId, referralCode)
            .then(() => {
               console.log("Participation rewarded!")
            })
            .catch((e) => {
               console.error(e)
            })
      }
   }
}

export default useRewardLivestreamAttendance
