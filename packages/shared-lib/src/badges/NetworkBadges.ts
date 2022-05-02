import { Badge, calculateProgressForNumericField } from "./badges"

export const NetworkerBadge: Badge = {
   key: "Networker",
   name: "Networker",
   level: 1,
   achievementDescription: "Refer at least 3 friends",
   rewardsDescription: ["Questions during an event will be highlighted"],
   progress: (userData) =>
      calculateProgressForNumericField(userData?.referralsCount, 3),
}

// not used atm, just an example
export const NetworkerAdvancedBadge: Badge = {
   key: "NetworkerAdvanced",
   name: "Networker Advanced",
   level: 2,
   achievementDescription: "Refer at least 6 friends",
   rewardsDescription: ["Questions during an event will be highlighted"],
   progress: (userData) =>
      calculateProgressForNumericField(userData?.referralsCount, 6),
}

// Relations
NetworkerBadge.next = NetworkerAdvancedBadge
NetworkerAdvancedBadge.prev = NetworkerBadge
