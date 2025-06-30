import { useAnonymousRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import CircularLoader from "components/views/loader/CircularLoader"
import { CustomJobsList } from "../CustomJobsList"

type Props = {
   limit: number
   forceFetch?: boolean
   bypassCache?: boolean
}

export const AnonymousRecommendedJobs = ({
   limit,
   forceFetch,
   bypassCache,
}: Props) => {
   const { jobs: customJobs, loading: isRecommendedJobsLoading } =
      useAnonymousRecommendedJobs({
         limit,
         forceFetch,
         bypassCache,
      })

   if (isRecommendedJobsLoading) return <CircularLoader sx={{ mt: 2 }} />

   if (!customJobs?.length) return null

   return <CustomJobsList customJobs={customJobs} />
}
