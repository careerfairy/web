import { memo } from "react"
import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"

import { sxStyles } from "types/commonTypes"
import { CompanyInformationProvider } from "./CompanyInformationProvider"
import CompanyIdentity from "../../../admin/companyInformation/CompanyIdentity"
import CompanyDetails from "../../../admin/companyInformation/CompanyDetails"
import TargetTalent from "../../../admin/companyInformation/TargetTalent"
import LiveStreamRegistrationQuestions from "../../../admin/companyInformation/LiveStreamRegistrationQuestions"
import PrivacyPolicy from "../../../admin/companyInformation/PrivacyPolicy"

const styles = sxStyles({
   content: {
      alignSelf: "center",
      display: "flex",
      width: "1100px",
      padding: "32px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "48px",
      flexShrink: 0,
      paddingY: 2,
      borderRadius: "16px",
      background: "#FDFDFD",
      marginTop: "32px",
   },
   gridItem: {
      display: "flex",
   },
})

const CompanyInformationPageContent = () => {
   return (
      <CompanyInformationProvider>
         <MemoizedPageContent />
      </CompanyInformationProvider>
   )
}

const PageContent = () => {
   return (
      <Box sx={styles.content}>
         <Container maxWidth={false}>
            <Grid container spacing={3}>
               <Grid item style={styles.gridItem}>
                  <CompanyIdentity />
               </Grid>

               <Grid item style={styles.gridItem}>
                  <CompanyIdentity />
               </Grid>

               <Grid item style={styles.gridItem}>
                  <TargetTalent />
               </Grid>

               <Grid item style={styles.gridItem}>
                  <LiveStreamRegistrationQuestions />
               </Grid>

               <Grid item style={styles.gridItem}>
                  <PrivacyPolicy />
               </Grid>
            </Grid>
         </Container>
      </Box>
   )
}

const MemoizedPageContent = memo(PageContent)

export default CompanyInformationPageContent
