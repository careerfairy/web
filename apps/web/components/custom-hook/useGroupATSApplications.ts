import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { useCallback } from "react"
import useSWR from "swr"
import { livestreamRepo } from "../../data/RepositoryInstances"

/**
 * Grabs the ATS applications for a given group & integration
 *
 * 1. Grabs the livestreams with jobs for that group
 * 2. Grabs the userLivestreamData docs with job applications for the given livestreams
 * 3. Mutates the userLivestreamData docs to only have applications for the given integration
 *
 * @param groupId
 * @param integrationId
 */
const useGroupATSApplications = (
   groupId: string,
   integrationId: string
): UserLivestreamData[] => {
   const livestreamsFetcher = useCallback(
      (groupId) =>
         livestreamRepo.getLivestreamsWithJobs(groupId).then((livestreams) => {
            // we're only interested in the livestreams that have jobs for the given integration id
            // the livestream can belong to multiple groups (groupIds[]) and may have jobs with from different ats integrations
            const filteredLivestreams = livestreams?.filter((stream) =>
               stream.jobs.some((job) => job.integrationId === integrationId)
            )

            if (!filteredLivestreams || filteredLivestreams?.length === 0) {
               return []
            }

            return livestreamRepo
               .getApplications(filteredLivestreams.map((stream) => stream.id))
               .then((applications) =>
                  applications.map((application) =>
                     // remove job applications that belong to other integration id
                     // the group can have multiple ats integrations
                     filterJobApplications(
                        application,
                        filteredLivestreams,
                        integrationId
                     )
                  )
               )
         }),
      [integrationId]
   )

   const { data: applications } = useSWR<UserLivestreamData[]>(
      groupId,
      livestreamsFetcher,
      {
         suspense: true,
      }
   )

   return applications
}

/**
 * Removes the job entries that aren't valid inside the userLivestreamData document
 *
 * Mutates the object in place
 * @param data
 * @param livestreams
 * @param integrationId
 */
function filterJobApplications(
   data: UserLivestreamData,
   livestreams: LivestreamEvent[],
   integrationId: string
) {
   // job ids for the given integration id
   const validJobIds = livestreams
      .map((stream) =>
         stream.jobs
            .filter((j) => j.integrationId === integrationId)
            .map((j) => j.jobId)
      )
      .flat()

   for (const jobId in data.jobApplications) {
      if (!validJobIds.includes(jobId)) {
         delete data.jobApplications[jobId]
      }
   }

   return data
}

export default useGroupATSApplications
