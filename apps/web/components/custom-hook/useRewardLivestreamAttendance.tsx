import { useEffect } from "react"
import { useLocalStorage, useSessionStorage } from "react-use"
import {
   localStorageInvite,
   localStorageReferralCode,
} from "../../constants/localStorageKeys"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import * as Sentry from "@sentry/nextjs"
import {
   REWARD_LIVESTREAM_ATTENDANCE_SECONDS,
   RewardActions,
} from "@careerfairy/shared-lib/dist/rewards"
import { useAuth } from "../../HOCs/AuthProvider"

const useRewardLivestreamAttendance = (livestreamData) => {
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
   const firebaseService = useFirebaseService()

   useEffect(() => {
      if (
         !livestreamData ||
         !livestreamData?.hasStarted ||
         livestreamData?.hasEnded
      ) {
         return // do nothing, stream is not live
      }

      if (!isLoggedIn) {
         return // do nothing, no user to reward
      }

      const isInvitation =
         invite && referralCode && invite !== livestreamData.id

      if (alreadyRewarded === livestreamData.id) {
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
   ])

   const reward = (isInvitation) => {
      setAlreadyRewarded(livestreamData.id)
      setStarted(null)

      firebaseService
         .rewardUserAction(
            RewardActions.LIVESTREAM_USER_ATTENDED,
            livestreamData.id
         )
         .then((r) => {
            console.log("User Attendance rewarded!")
         })
         .catch((e) => {
            console.error(e)
         })

      if (isInvitation) {
         firebaseService
            .rewardLivestreamAttendance(livestreamData.id, referralCode)
            .then((r) => {
               console.log("Participation rewarded!")
            })
            .catch((e) => {
               console.error(e)
            })
      }
   }
}

export default useRewardLivestreamAttendance
