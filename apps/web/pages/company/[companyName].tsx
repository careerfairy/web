import DashboardHead from "../../layouts/GroupDashboardLayout/DashboardHead"
import CompanyPageOverview from "../../components/views/company-page"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "../../data/RepositoryInstances"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import { GetStaticPaths, GetStaticProps } from "next"

const CompanyPage = ({ serverSideGroup }) => {
   if (!serverSideGroup) {
      return null
   }

   const { universityName } = serverSideGroup as Group
   return (
      <>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <Box sx={{ backgroundColor: "white", minHeight: "100vh" }}>
            <CompanyPageOverview group={serverSideGroup} editMode={false} />
         </Box>
      </>
   )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
   const { companyName: companyNameSlug } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      // if (serverSideGroup && serverSideGroup.publicProfile) {
      if (serverSideGroup) {
         return {
            props: {
               serverSideGroup,
            },
            revalidate: 60,
         }
      }

      return {
         notFound: true,
      }
   }
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default CompanyPage
