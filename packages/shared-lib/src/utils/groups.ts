import { Group } from "../groups"

export const generateFeaturedCompanyPriority = (group: Group): number => {
   if (group.hasJobs && group.hasUpcomingEvents) return 4
   if (group.hasUpcomingEvents && !group.hasJobs) return 3
   if (group.hasJobs && !group.hasUpcomingEvents) return 2
   if (!group.hasJobs && !group.hasUpcomingEvents && group.hasSparks) return 1
   return 0
}
