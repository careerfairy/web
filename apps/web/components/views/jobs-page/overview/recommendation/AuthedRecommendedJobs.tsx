import CircularLoader from "components/views/loader/CircularLoader"

import { CustomJobsList } from "../CustomJobsList"

import { useUserRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"

type Props = {
   userAuthId: string
   limit: number
   forceFetch?: boolean
   bypassCache?: boolean
}

export const AuthedRecommendedJobs = ({
   userAuthId,
   limit,
   forceFetch,
   bypassCache,
}: Props) => {
   const { jobs: customJobs, loading: isRecommendedJobsLoading } =
      useUserRecommendedJobs({
         userAuthId,
         limit,
         forceFetch,
         bypassCache,
      })

   if (isRecommendedJobsLoading) return <CircularLoader sx={{ mt: 2 }} />

   if (!customJobs?.length) return null

   return <CustomJobsList customJobs={customJobs} />
}
