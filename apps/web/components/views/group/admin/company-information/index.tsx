import { FC, memo } from "react"
import { Container, Grid } from "@mui/material"
import { Box } from "@mui/system"

import { sxStyles } from "types/commonTypes"
import { CompanyInformationProvider } from "./CompanyInformationProvider"
import CompanyIdentity from "../../../admin/company-information/CompanyIdentity"
import CompanyDetails from "../../../admin/company-information/CompanyDetails"
import TargetTalent from "../../../admin/company-information/TargetTalent"
import LiveStreamRegistrationQuestions from "../../../admin/company-information/LiveStreamRegistrationQuestions"
import PrivacyPolicy from "../../../admin/company-information/PrivacyPolicy"

const styles = sxStyles({
   root: (theme) => ({
      display: "flex",
      minHeight: "fit-content",
      width: "stretch",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
      borderRadius: "16px",
      background: theme.palette.background.paper,
      padding: theme.spacing(3),
      margin: theme.spacing(3, 2, 3, 2),
      "> div": {
         display: "flex",
         width: "100%",
      },
   }),
   container: {
      gap: "96px",
   },
})

const CompanyInformationPageContent: FC = () => {
   return (
      <CompanyInformationProvider>
         <MemoizedPageContent />
      </CompanyInformationProvider>
   )
}

const PageContent = () => {
   return (
      <Container sx={styles.root} maxWidth="lg">
         <Grid container style={styles.container}>
            <Grid item>
               <CompanyIdentity />
            </Grid>

            <Grid item>
               <CompanyDetails />
            </Grid>

            <Grid item>
               <TargetTalent />
            </Grid>

            <Grid item>
               <LiveStreamRegistrationQuestions />
            </Grid>

            <Grid item>
               <PrivacyPolicy />
            </Grid>
         </Grid>
      </Container>
   )
}

const MemoizedPageContent = memo(PageContent)

export default CompanyInformationPageContent
