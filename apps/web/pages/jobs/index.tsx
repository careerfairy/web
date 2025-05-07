import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { JobsOverviewContextProvider } from "components/views/jobs-page/JobsOverviewContext"
import JobsPageOverview from "components/views/jobs-page/JobsPageOverview"
import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const JobsPage = () => {
   const isMounted = useIsMounted()

   if (!isMounted) {
      return null
   }

   return (
      <>
         <SEO
            id={"CareerFairy | Jobs"}
            description={"Find your dream job with CareerFairy."}
            title={"CareerFairy | Jobs"}
         />
         <GenericDashboardLayout>
            <JobsOverviewContextProvider>
               <JobsPageOverview />
            </JobsOverviewContextProvider>
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default JobsPage
