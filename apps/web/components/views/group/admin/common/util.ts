import { GroupStats } from "@careerfairy/shared-lib/groups/stats"

/**
 * Sum the total of people reached
 *
 * Since the numberOfPeopleReached was introduced afterwards, it still has a small value for
 * some groups, lets sum it with the registrations until it catches up
 */
export function totalPeopleReached(stats: GroupStats) {
   if (!stats) return 0

   const companyPageViews =
      stats.generalStats.numberOfPeopleReachedCompanyPage ?? 0

   const totalReached =
      stats.generalStats.numberOfPeopleReached + companyPageViews

   // # views are still low, sum with registrations
   if (totalReached < stats.generalStats.numberOfRegistrations) {
      return totalReached + stats.generalStats.numberOfRegistrations
   }

   return totalReached ?? 0
}
