import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import { useEffect, useState } from "react"
import { atsServiceInstance } from "../../data/firebase/ATSService"

/**
 * This hook fetches all the available jobs from all the linked accounts
 *
 * Useful when creating livestreams, the group admin can choose jobs from all integrations
 */
const useGroupATSJobsAllIntegrations = (accounts: GroupATSAccount[]) => {
   const [jobs, setJobs] = useState<Job[]>([])

   useEffect(() => {
      let mounted = true

      fetchAllJobs(accounts)
         .then((res) => {
            // we only care about the successful responses
            const jobs = res
               .filter((r) => r.status === "fulfilled")
               .map((r) => (r as PromiseFulfilledResult<Job[]>).value)
               .flat()

            if (mounted) {
               setJobs(jobs)
            }
         })
         .catch((e) => {
            console.error("Failed to fetch jobs", e)
         })

      return () => {
         mounted = false
      }
   }, [accounts])

   return jobs
}

function fetchAllJobs(accounts: GroupATSAccount[]) {
   return Promise.allSettled(
      accounts.map((account) =>
         atsServiceInstance.getAllJobs(account.groupId, account.id)
      )
   )
}

export default useGroupATSJobsAllIntegrations
