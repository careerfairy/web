import SEO from "../../components/util/SEO"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import CompaniesPageOverview from "../../components/views/companies/CompaniesPageOverview"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const CompaniesPage = () => {
   return (
      <>
         <SEO
            id={"CareerFairy | Companies"}
            description={"Meet all the partners of CareerFairy."}
            title={"CareerFairy | Companies"}
         />
         <GenericDashboardLayout pageDisplayName={"Companies"}>
            <CompaniesPageOverview />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default CompaniesPage
