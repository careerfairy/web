import { useAuth } from "./AuthProvider";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useFirebaseService } from "../context/firebase/FirebaseServiceContext";
import { Reward } from "../types/reward";
import { getHumanStringDescriptionForAction } from "../../shared/rewards";

const UserRewardsNotifications = ({ children }) => {
   const { userData } = useAuth();
   const firebaseService = useFirebaseService();
   const { enqueueSnackbar } = useSnackbar();

   useEffect(() => {
      if (!userData) return;

      return firebaseService.rewardListenToUnSeenUserRewards(
         userData.id,
         (querySnapshot) => {
            /**
             * Group rewards so that we can display a notification per type of reward (with a count) instead of
             * a notification per reward (imagine the scenario where a user has invited a lot of other users for a
             * stream, next time opening the website he would receive a spam of notifications)
             */
            const groups = {};
            querySnapshot.forEach((doc) => {
               let reward = doc.data() as Reward;
               if (groups[reward.action]) {
                  groups[reward.action].push(reward);
               } else {
                  groups[reward.action] = [reward];
               }
            });

            // Show a notification
            for (let action in groups) {
               const actionHumanString =
                  getHumanStringDescriptionForAction(action);
               const total = groups[action].length;
               const rewardsPlural = total === 1 ? "reward" : "rewards";
               const notification = `You have received ${total} ${rewardsPlural} for ${actionHumanString}!`;
               enqueueSnackbar(notification, {
                  variant: "success",
                  preventDuplicate: true,
               });
            }

            // Mark rewards as seen
            const refs = querySnapshot.docs.map((d) => d.ref);
            if (refs.length > 0) {
               firebaseService.rewardMarkManyAsSeen(refs).catch(console.error);
            }
         }
      );
   }, [userData]);

   return children;
};

export default UserRewardsNotifications;
