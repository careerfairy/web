import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import GroupPlansDialog from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import { useSelector } from "react-redux"
import { clientSecret } from "store/selectors/groupSelectors"
import StripeCheckoutComponent from "../forms/StripeCheckoutComponent"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      backgroundColor: "#F6F6FA",
   },
   stripeButtonWrapper: {
      display: "flex",
      justifyItems: "center",
      alignContent: "center",
      justifyContent: "center",
      mb: "560px",
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
   const generatedClientSecret = useSelector(clientSecret)

   return (
      <GroupPlansDialog.Container>
         <GroupPlansDialog.Content sx={styles.content}>
            <GroupPlansDialog.Title>
               <Box component="span" color="secondary.main">
                  Checkout
               </Box>{" "}
            </GroupPlansDialog.Title>
            <GroupPlansDialog.Subtitle>
               Once you confirm the payment, your plan will be updated
               automatically and you{"'"}ll receive an invoice directly in your
               email.
            </GroupPlansDialog.Subtitle>
            <Box mt={5} />
            <Box
               mt={{
                  md: 0,
               }}
            />
            <Box sx={styles.stripeButtonWrapper}>
               <StripeCheckoutComponent clientSecret={generatedClientSecret} />
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
