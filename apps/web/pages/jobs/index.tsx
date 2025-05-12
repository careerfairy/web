import {
   CustomJobsPresenter,
   SerializedCustomJob,
} from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import {
   JobsOverviewContextProvider,
   SearchParams,
} from "components/views/jobs-page/JobsOverviewContext"
import JobsPageOverview from "components/views/jobs-page/JobsPageOverview"
import { customJobRepo } from "data/RepositoryInstances"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
const JobsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serializedCustomJobs, searchParams }) => {
   const isMounted = useIsMounted()
   const seoTitle = getSeoTitle(serializedCustomJobs, searchParams)

   if (!isMounted) {
      return null
   }

   return (
      <>
         <SEO
            id={"CareerFairy | Jobs | " + searchParams.term}
            description={"Find your dream job with CareerFairy."}
            title={seoTitle}
         />
         <GenericDashboardLayout>
            <JobsOverviewContextProvider>
               <JobsPageOverview />
            </JobsOverviewContextProvider>
            <ScrollToTop hasBottomNavBar />
         </GenericDashboardLayout>
      </>
   )
}

const getSeoTitle = (
   serializedCustomJobs: SerializedCustomJob[],
   searchParams: SearchParams
) => {
   if (
      !searchParams.location.length &&
      !searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs on CareerFairy`
   }

   if (
      searchParams.location.length &&
      !searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${
         serializedCustomJobs?.length
      } Jobs in ${searchParams.location.join(", ")} on CareerFairy`
   }

   if (
      !searchParams.location.length &&
      searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs for ${searchParams.term} on CareerFairy`
   }

   if (
      searchParams.location.length &&
      searchParams.term &&
      serializedCustomJobs?.length
   ) {
      return `${serializedCustomJobs?.length} Jobs for ${
         searchParams.term
      } in ${searchParams.location.join(", ")} on CareerFairy`
   }

   return `Jobs on CareerFairy`
}

type JobsPageProps = {
   serializedCustomJobs: SerializedCustomJob[]
   searchParams: SearchParams
}

export const getServerSideProps: GetServerSideProps<JobsPageProps> = async (
   context
) => {
   const { location, term = "", jobId, redirected } = context.query
   const locations = (location as string[]) || []

   // TODO: Replace with Algolia search using the searchParams
   const customJobs = await customJobRepo.getPublishedCustomJobs()
   const firstCustomJob = customJobs?.at(0)

   const customJob = jobId
      ? await customJobRepo.getCustomJobById(jobId as string)
      : firstCustomJob

   const serializedCustomJobs =
      customJobs?.map((job) => CustomJobsPresenter.serializeDocument(job)) ?? []

   // Add redirect to include the jobId in the URL if it's not already there
   if (!redirected && ((jobId && !customJob) || !jobId)) {
      return {
         redirect: {
            destination: `/jobs?${new URLSearchParams({
               ...(locations.length && { location: locations.join(",") }),
               ...(term && { term: term.toString() }),
               // If there is no jobId, we redirect to the first job
               jobId: firstCustomJob?.id || "",
               redirected: "true",
            })}`,
            permanent: false,
         },
      }
   }

   return {
      props: {
         serializedCustomJobs,
         searchParams: {
            location: locations,
            term: term as string,
         },
      },
   }
}
export default JobsPage
