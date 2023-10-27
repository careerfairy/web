import {
   Badge,
   calculateProgressForNumericField,
   DEFAULT_REWARDS,
} from "./badges"
import { UserStats } from "../users"

export const ResearchBadge: Badge = new Badge(
   "Research",
   "Research",
   1,
   [
      {
         description: "Attend 1 live stream",
         isComplete: (userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 1,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               1
            ),
      },
   ],
   ["1 CareerCoin", ...DEFAULT_REWARDS]
)

export const ResearchBadgeLevel2: Badge = new Badge(
   "Research2",
   "Research",
   2,
   [
      {
         description: "Attend 3 live stream",
         isComplete: (userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 3,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               3
            ),
      },
   ],
   ["Unlimited Highlights views"]
)

export const ResearchBadgeLevel3: Badge = new Badge(
   "Research3",
   "Research",
   3,
   [
      {
         description: "Attend 10 live stream",
         isComplete: (userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 10,
         progress: (userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               10
            ),
      },
   ],
   DEFAULT_REWARDS
)

// Links
// ResearchBadge <-> ResearchBadgeLevel2 <-> ResearchBadgeLevel3
ResearchBadge.setNextBadge(ResearchBadgeLevel2)
ResearchBadgeLevel2.setNextBadge(ResearchBadgeLevel3)
