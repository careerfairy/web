import { Badge, calculateProgressForNumericField } from "./badges"

export const ResearchBadge: Badge = new Badge(
   "Research",
   "Research",
   2,
   [
      {
         description: "Attend 1 Livestream Event",
         isComplete: (userData) => userData?.livestreamsAttendances >= 1,
         progress: (userData) =>
            calculateProgressForNumericField(
               userData?.livestreamsAttendances,
               1
            ),
      },
   ],
   ["Save Recruiters to a list you can access later"]
)
