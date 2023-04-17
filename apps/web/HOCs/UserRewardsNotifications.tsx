import { useAuth } from "./AuthProvider"
import { useEffect } from "react"
import { useSnackbar } from "notistack"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import {
   getHumanStringDescriptionForAction,
   RewardAction,
   RewardDoc,
} from "@careerfairy/shared-lib/dist/rewards"

const UserRewardsNotifications = ({ children }) => {
   const { userData } = useAuth()
   const firebaseService = useFirebaseService()
   const { enqueueSnackbar } = useSnackbar()

   useEffect(() => {
      if (!userData || !userData.id) return

      return firebaseService.rewardListenToUnSeenUserRewards(
         userData.id,
         (querySnapshot) => {
            /**
             * Group rewards so that we can display a notification per type of reward (with a count) instead of
             * a notification per reward (imagine the scenario where a user has invited a lot of other users for a
             * stream, next time opening the website he would receive a spam of notifications)
             */
            const groups: Partial<Record<RewardAction, RewardDoc[]>> = {}
            querySnapshot.forEach((doc) => {
               let reward = doc.data() as RewardDoc
               if (groups[reward.action]) {
                  groups[reward.action].push(reward)
               } else {
                  groups[reward.action] = [reward]
               }
            })

            // Show a notification
            for (let action in groups) {
               const actionHumanString = getHumanStringDescriptionForAction(
                  action as RewardAction
               )
               const total = groups[action].length
               const rewardsPlural = total === 1 ? "reward" : "rewards"
               const notification = `You have received ${total} ${rewardsPlural} for ${actionHumanString}!`
               enqueueSnackbar(notification, {
                  variant: "success",
                  preventDuplicate: false,
               })
            }

            // Mark rewards as seen
            const refs = querySnapshot.docs.map((d) => d.ref)
            if (refs.length > 0) {
               setTimeout(() => {
                  firebaseService
                     .rewardMarkManyAsSeen(refs)
                     .then((_) =>
                        console.log(`${refs.length} rewards marked as seen`)
                     )
                     .catch(console.error)
               }, 3000) // wait for the notifications to popup
            }
         }
      )
   }, [userData?.id])

   return children
}

export default UserRewardsNotifications
