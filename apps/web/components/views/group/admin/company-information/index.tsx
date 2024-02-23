import { FC, memo } from "react"
import { Box, Container, Stack } from "@mui/material"

import { sxStyles } from "types/commonTypes"
import CompanyIdentity from "components/views/admin/company-information/CompanyIdentity"
import TargetTalent from "components/views/admin/company-information/TargetTalent"
import LiveStreamRegistrationQuestions from "components/views/admin/company-information/LiveStreamRegistrationQuestions"
import PrivacyPolicy from "components/views/admin/company-information/PrivacyPolicy"
import dynamic from "next/dynamic"

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

const CompanyDetails = dynamic(() => import('../../../admin/company-information/CompanyDetails'), { ssr: false })

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

               <PrivacyPolicy />
            </Stack>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default CompanyInformationPageContent
