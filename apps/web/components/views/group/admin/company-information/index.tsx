import { FC, memo } from "react"
import { Box, Container, Stack } from "@mui/material"

import { sxStyles } from "types/commonTypes"
import CompanyIdentity from "components/views/admin/company-information/CompanyIdentity"
import CompanyDetails from "components/views/admin/company-information/CompanyDetails"
import TargetTalent from "components/views/admin/company-information/TargetTalent"
import LiveStreamRegistrationQuestions from "components/views/admin/company-information/LiveStreamRegistrationQuestions"
// import LiveStreamRegistrationQuestions from "../../../admin/company-information/LiveStreamRegistrationQuestions"
// import PrivacyPolicy from "../../../admin/company-information/PrivacyPolicy"

const styles = sxStyles({
   container: {
      display: "flex",
      bgcolor: "background.paper",
      borderRadius: {
         xs: 0,
         md: 4,
      },
      p: 4,
   },
   root: {
      py: {
         md: 3,
      },
      px: {
         md: 6.25,
      },
   },
})

const CompanyInformationPageContent: FC = () => {
   return <MemoizedPageContent />
}

const PageContent = () => {
   return (
      <Box sx={styles.root}>
         <Container sx={styles.container} maxWidth="xl">
            <Stack spacing={12}>
               <CompanyIdentity />

               <CompanyDetails />

               <TargetTalent />

               <LiveStreamRegistrationQuestions />

               {/* <PrivacyPolicy /> */}
            </Stack>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default CompanyInformationPageContent
