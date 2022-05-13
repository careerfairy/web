import { Badge, calculateProgressForNumericField } from "./badges"
import { UserData, UserStats } from "../users"

export const NetworkerBadge: Badge = new Badge(
   "Networker",
   "Networker",
   1,
   [
      {
         description: "Refer 1 friend to the platform",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userData?.referralsCount >= 1,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userData?.referralsCount, 1),
      },
   ],
   []
)

export const NetworkerBadgeLevel2: Badge = new Badge(
   "Networker2",
   "Networker",
   2,
   [
      {
         description: "Refer 3 friends to the platform",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userData?.referralsCount >= 3,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userData?.referralsCount, 3),
      },
   ],
   ["Questions during an event will be highlighted"]
)

export const NetworkerBadgeLevel3: Badge = new Badge(
   "Networker3",
   "Networker",
   3,
   [
      {
         description: "Refer 10 friends to the platform",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userData?.referralsCount >= 10,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userData?.referralsCount, 10),
      },
      {
         description: "Invite 5 friends to events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalLivestreamInvites >= 5,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamInvites,
               5
            ),
      },
   ],
   []
)

// Links
// NetworkerBadge <-> NetworkerBadgeLevel2 <-> NetworkerBadgeLevel3
NetworkerBadge.setNextBadge(NetworkerBadgeLevel2)
NetworkerBadgeLevel2.setNextBadge(NetworkerBadgeLevel3)
