import { Badge, calculateProgressForNumericField } from "./badges"
import { UserData, UserStats } from "../users"

export const ResearchBadge: Badge = new Badge(
   "Research",
   "Research",
   1,
   [
      {
         description: "Attend 1 Livestream Event",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 1,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               1
            ),
      },
   ],
   ["Save Recruiters to a list you can access later"]
)

export const ResearchBadgeLevel2: Badge = new Badge(
   "Research2",
   "Research",
   2,
   [
      {
         description: "Attend 3 Livestream Events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 3,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               3
            ),
      },
   ],
   []
)

export const ResearchBadgeLevel3: Badge = new Badge(
   "Research3",
   "Research",
   3,
   [
      {
         description: "Attend 10 Livestream Events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalLivestreamAttendances >= 10,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalLivestreamAttendances,
               10
            ),
      },
   ],
   []
)

// Links
// ResearchBadge <-> ResearchBadgeLevel2 <-> ResearchBadgeLevel3
ResearchBadge.setNextBadge(ResearchBadgeLevel2)
ResearchBadgeLevel2.setNextBadge(ResearchBadgeLevel3)
