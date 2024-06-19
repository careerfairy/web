import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

export const getCustomJobsByLinkedContentIds = (
   customJobs: CustomJob[],
   linkField: keyof Pick<CustomJob, "sparks" | "livestreams">,
   ids: string[]
): Promise<CustomJob[]> => {
   return Promise.resolve(
      customJobs.filter((job) =>
         job[linkField].filter((id) => ids.includes(id))
      )
   )
}
