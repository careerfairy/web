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
               automatically and you{"'"}ll receive a invoice straight to your
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
