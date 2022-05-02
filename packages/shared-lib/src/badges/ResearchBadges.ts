import { Badge, calculateProgressForNumericField } from "./badges"

export const ResearchBadge: Badge = {
   key: "Research",
   name: "Research",
   level: 1,
   achievementDescription: "Attend 1 Livestream Event",
   rewardsDescription: ["Save Recruiters to a list you can access later"],
   progress: (userData) =>
      calculateProgressForNumericField(userData?.livestreamsAttendances, 1),
}

// Not used yet
export const ResearchLevel2Badge: Badge = {
   key: "Research",
   name: "Research",
   level: 2,
   achievementDescription: "Attend 3 Livestreams Events",
   rewardsDescription: ["TBD later"],
   progress: (userData) =>
      calculateProgressForNumericField(userData?.livestreamsAttendances, 3),
}

// Relations
ResearchBadge.next = ResearchLevel2Badge
ResearchLevel2Badge.prev = ResearchBadge
