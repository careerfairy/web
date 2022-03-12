import { useEffect } from "react";
import { useLocalStorage, useSessionStorage } from "react-use";
import {
   localStorageInvite,
   localStorageReferralCode,
} from "../../constants/localStorageKeys";
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext";
import * as Sentry from "@sentry/nextjs";
import { REWARD_LIVESTREAM_ATTENDANCE_SECONDS } from "../../../shared/rewards";

const useRewardLivestreamAttendance = (livestreamData) => {
   const [invite] = useLocalStorage(localStorageInvite, null, { raw: true });
   const [referralCode] = useLocalStorage(localStorageReferralCode, "", {
      raw: true,
   });
   const [started, setStarted] = useSessionStorage(
      "livestreamAttendanceStarted"
   );
   const [alreadyRewarded, setAlreadyRewarded] = useSessionStorage(
      "livestreamAttendanceRewarded"
   );
   const firebaseService = useFirebaseService();

   useEffect(() => {
      if (
         !livestreamData ||
         !livestreamData?.hasStarted ||
         livestreamData?.hasEnded
      ) {
         return; // do nothing, stream is not live
      }

      if (!invite || !referralCode || invite !== livestreamData.id) {
         return; // no invite for this livestream event
      }

      if (alreadyRewarded === livestreamData.id) {
         return; // do nothing, user already has been rewarded
      }

      try {
         let seconds = REWARD_LIVESTREAM_ATTENDANCE_SECONDS;
         if (started) {
            const diffSeconds =
               (Date.now() - parseInt(started as string)) / 1000;
            seconds = Math.round(seconds - diffSeconds);
         } else {
            setStarted(Date.now());
         }

         if (seconds <= 0) {
            reward();
         } else {
            const interval = setTimeout(() => {
               reward();
            }, seconds * 1000);

            return () => {
               clearTimeout(interval);
            };
         }
      } catch (e) {
         Sentry.captureException(e);
         console.error(e);
      }
   }, [
      livestreamData?.hasStarted,
      started,
      alreadyRewarded,
      invite,
      referralCode,
   ]);

   const reward = () => {
      setAlreadyRewarded(livestreamData.id);
      setStarted(null);

      firebaseService
         .rewardLivestreamAttendance(livestreamData.id, referralCode)
         .then((r) => {
            console.log("Participation rewarded!");
         })
         .catch((e) => {
            console.error(e);
         });
   };
};

export default useRewardLivestreamAttendance;
