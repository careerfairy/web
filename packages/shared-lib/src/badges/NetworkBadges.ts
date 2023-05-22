import {
   Badge,
   calculateProgressForNumericField,
   DEFAULT_REWARDS,
} from "./badges"
import { UserStats } from "../users"

export const NetworkerBadge: Badge = new Badge(
   "Networker",
   "Networker",
   1,
   [
      {
         description: "Refer 1 friend to the platform",
         isComplete: (userStats: UserStats) => userStats?.referralsCount >= 1,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.referralsCount, 1),
      },
   ],
   DEFAULT_REWARDS
)

export const NetworkerBadgeLevel2: Badge = new Badge(
   "Networker2",
   "Networker",
   2,
   [
      {
         description: "Refer 3 friends to the platform",
         isComplete: (userStats: UserStats) => userStats?.referralsCount >= 3,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.referralsCount, 3),
      },
   ],
   ["3 CareerCoins", "Save Recruiters during a livestream"]
)

export const NetworkerBadgeLevel3: Badge = new Badge(
   "Networker3",
   "Networker",
   3,
   [
      {
         description: "Refer 10 friends to the platform",
         isComplete: (userStats: UserStats) => userStats?.referralsCount >= 10,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.referralsCount, 10),
      },
      {
         description: "Invite 5 friends to events",
         isComplete: (userStats: UserStats) =>
            userStats?.totalLivestreamInvites >= 5,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamInvites,
               5
            ),
      },
   ],
   DEFAULT_REWARDS
)

// Links
// NetworkerBadge <-> NetworkerBadgeLevel2 <-> NetworkerBadgeLevel3
NetworkerBadge.setNextBadge(NetworkerBadgeLevel2)
NetworkerBadgeLevel2.setNextBadge(NetworkerBadgeLevel3)
