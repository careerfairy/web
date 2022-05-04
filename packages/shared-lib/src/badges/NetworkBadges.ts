import { Badge, calculateProgressForNumericField } from "./badges"

export const NetworkerBadge: Badge = new Badge(
   "Networker",
   "Networker",
   1,
   [
      {
         description: "Refer at least 3 friends",
         isComplete: (userData) => userData?.referralsCount >= 3,
         progress: (userData) =>
            calculateProgressForNumericField(userData?.referralsCount, 3),
      },
   ],
   ["Questions during an event will be highlighted"]
)
