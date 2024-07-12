import { Job } from "@careerfairy/shared-lib/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
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
   const promises = []

   for (const account of accounts) {
      promises.push(atsServiceInstance.getAllJobs(account.groupId, account.id))
   }

   return Promise.allSettled(promises)
}

export default useGroupATSJobsAllIntegrations
