import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

// const validWorkplaceOptions: CustomJobWorkplace[] = ["hybrid", "remote"]

export const useCustomJobLocation = (customJob: CustomJob) => {
   //    const { data: jobLocationData } = useLocation(customJob?.jobLocation)

   //    const jobWorkplace = customJob?.workplace && validWorkplaceOptions.includes(customJob.workplace) ? workplaceOptionsMap[customJob.workplace] : null

   //    const workplaceText = jobWorkplace ? `(${jobWorkplace.label})` : ""

   //    if(!jobLocationData?.name)
   //         return null

   //     return `${jobLocationData?.name} ${workplaceText}`
   const firstLocation = customJob.jobLocation?.[0]?.name

   const otherLocationsCount = customJob.jobLocation?.length - 1

   return firstLocation
      ? `${firstLocation} ${
           otherLocationsCount ? `+${otherLocationsCount}` : ""
        }`
      : ""
}
