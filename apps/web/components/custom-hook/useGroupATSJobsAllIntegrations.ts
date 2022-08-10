import useGroupATSAccounts from "./useGroupATSAccounts"
import { useEffect, useState } from "react"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import useGroupATSJobs from "./useGroupATSJobs"

/**
 * This hook fetches all the available jobs from all the linked accounts
 *
 * Useful when creating livestreams, the group admin can choose jobs from all integrations
 * @param groupId
 */
const useGroupATSJobsAllIntegrations = (groupId: string) => {
   const accounts = useGroupATSAccounts(groupId)
   const jobs = useState<Job[]>([])

   useEffect(() => {
      let mounted = true

      return () => {
         mounted = false
      }
   }, [accounts])
}

export default useGroupATSJobsAllIntegrations
