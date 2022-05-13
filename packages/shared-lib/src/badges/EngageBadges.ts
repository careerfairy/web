import { Badge, calculateProgressForNumericField } from "./badges"
import { UserData, UserStats } from "../users"

export const EngageBadge: Badge = new Badge(
   "Engage",
   "Engage",
   1,
   [
      {
         description: "Ask 5 questions to livestream events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalQuestionsAsked >= 5,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.totalQuestionsAsked, 5),
      },
   ],
   []
)

export const EngageBadgeLevel2: Badge = new Badge(
   "Engage2",
   "Engage",
   2,
   [
      {
         description: "Ask 10 questions to livestream events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalQuestionsAsked >= 10,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalQuestionsAsked,
               10
            ),
      },
      {
         description: "Do 1 Hand Raise during livestreams",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalHandRaises >= 1,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.totalHandRaises, 1),
      },
   ],
   []
)

export const EngageBadgeLevel3: Badge = new Badge(
   "Engage3",
   "Engage",
   3,
   [
      {
         description: "Ask 25 questions to livestream events",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalQuestionsAsked >= 25,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(
               userStats?.totalQuestionsAsked,
               25
            ),
      },
      {
         description: "Do 3 Hand Raises during livestreams",
         isComplete: (userData: UserData, userStats: UserStats) =>
            userStats?.totalHandRaises >= 3,
         progress: (userData: UserData, userStats: UserStats) =>
            calculateProgressForNumericField(userStats?.totalHandRaises, 3),
      },
   ],
   []
)

// Links
// EngageBadge <-> EngageBadgeLevel2 <-> EngageBadgeLevel3
EngageBadge.setNextBadge(EngageBadgeLevel2)
EngageBadgeLevel2.setNextBadge(EngageBadgeLevel3)
