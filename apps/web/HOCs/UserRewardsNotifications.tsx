import { useAuth } from "./AuthProvider"
import { useEffect } from "react"
import { useSnackbar } from "notistack"
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext"
import {
   getHumanStringDescriptionForAction,
   getCustomRewardMessageForAction,
   RewardAction,
   getCustomRewardMessageForAction,
   RewardDoc,
} from "@careerfairy/shared-lib/dist/rewards"
import RewardNotification from "../components/views/notifications/RewardNotification"

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
               const onlyOneReward = total === 1
               const rewardsPlural = onlyOneReward ? "reward" : "rewards"
               let notification = `You have received ${total} ${rewardsPlural} for ${actionHumanString}!`

               if (onlyOneReward) {
                  const customMessage = getCustomRewardMessageForAction(
                     action as RewardAction
                  )
                  if (customMessage) {
                     notification = customMessage
                  }
               }

               enqueueSnackbar(notification, {
                  variant: "success",
                  preventDuplicate: false,
                  key: action,
                  content: (key, message) => (
                     <RewardNotification id={key} message={message} />
                  ),
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData?.id])

   return children
}

export default UserRewardsNotifications
