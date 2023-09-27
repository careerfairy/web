import { FC, memo } from "react"
import { Box, Container, Grid } from "@mui/material"

import { sxStyles } from "types/commonTypes"
// import LiveStreamRegistrationQuestions from "../../../admin/company-information/LiveStreamRegistrationQuestions"
import CompanyIdentity from "../../../admin/company-information/CompanyIdentity"
// import CompanyDetails from "../../../admin/company-information/CompanyDetails"
// import TargetTalent from "../../../admin/company-information/TargetTalent"
// import PrivacyPolicy from "../../../admin/company-information/PrivacyPolicy"

const styles = sxStyles({
   root: {
      display: "flex",
      bgcolor: "background.paper",
      borderRadius: {
         xs: 0,
         md: 4,
      },
      p: 4,
   },
   container: {},
})

const CompanyInformationPageContent: FC = () => {
   return <MemoizedPageContent />
}

const PageContent = () => {
   return (
      <Box
         py={{
            md: 3,
         }}
         px={{
            md: 6.25,
         }}
      >
         <Container sx={styles.root} maxWidth="xl">
            <Grid container style={styles.container}>
               <Grid item>
                  <CompanyIdentity />
               </Grid>

               <Grid item>{/* <CompanyDetails /> */}</Grid>

               <Grid item sx={{ width: "100%" }}>
                  {/* <TargetTalent /> */}
               </Grid>

               <Grid item>{/* <LiveStreamRegistrationQuestions /> */}</Grid>

               <Grid item>{/* <PrivacyPolicy /> */}</Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default CompanyInformationPageContent
