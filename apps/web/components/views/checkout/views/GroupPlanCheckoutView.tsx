import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import GroupPlansDialog from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import { useSelector } from "react-redux"
import {
   clientSecret,
   selectedPlanSelector,
} from "store/selectors/groupSelectors"
import BuyButtonComponent from "../forms/BuyButtonComponent"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import { useGroup } from "layouts/GroupDashboardLayout"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      backgroundColor: "#F6F6FA",
   },
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
      width: "276px",

      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   checkoutWrapper: {
      mt: 2,
      alignItems: "center",
   },
   checkoutDescription: {
      color: (theme) => theme.palette.neutral[600],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
   },
   stripeButtonWrapper: {
      display: "flex",
      justifyItems: "center",
      alignContent: "center",
      justifyContent: "center",
   },
})

const GroupPlanCheckoutView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const selectedPlan = useSelector(selectedPlanSelector)
   const generatedClientSecret = useSelector(clientSecret)
   const { group } = useGroup()
   const buttonId = PLAN_CONSTANTS[selectedPlan].stripe?.buttonId(
      group.companyCountry.id
   )

   return (
      <GroupPlansDialog.Container>
         <GroupPlansDialog.Content sx={styles.content}>
            <GroupPlansDialog.Title>
               Select your{" "}
               <Box component="span" color="secondary.main">
                  Sparks
               </Box>{" "}
               plan
            </GroupPlansDialog.Title>
            <GroupPlansDialog.Subtitle>
               Tailored offers that best suit YOUR needs.
            </GroupPlansDialog.Subtitle>
            <Box mt={5} />
            <Box
               mt={{
                  md: 0,
               }}
            />
            <Box sx={styles.stripeButtonWrapper}>
               <BuyButtonComponent
                  buttonId={buttonId}
                  clientSecret={generatedClientSecret}
                  publishableKey={
                     process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  }
               />
            </Box>
            <Box
               mb={{
                  xs: "auto",
                  md: 0,
               }}
            />
         </GroupPlansDialog.Content>
      </GroupPlansDialog.Container>
   )
}

export default GroupPlanCheckoutView
