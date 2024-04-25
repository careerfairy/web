import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "types/commonTypes"
import { useSelector } from "react-redux"
import { clientSecret } from "store/selectors/groupSelectors"
import StripeCheckoutComponent from "../forms/StripeCheckoutComponent"

const styles = sxStyles({
   title: {
      color: (theme) => theme.brand.purple[600],
      fontSize: "28px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "42px",
   },
   stripeButtonWrapper: {
      display: "flex",
      justifyItems: "center",
      alignContent: "center",
      justifyContent: "center",
      mb: "680px",
   },
})

const GroupPlanCheckoutMobileView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const generatedClientSecret = useSelector(clientSecret)

   return (
      <Box>
         <Box>
            <Box component="span" color="secondary.main" sx={styles.title}>
               Checkout
            </Box>{" "}
         </Box>
         <Box mr={5}>
            Once you confirm the payment, your plan will be updated
            automatically and you{"'"}ll receive an invoice directly in your
            email.
         </Box>
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
      </Box>
   )
}

export default GroupPlanCheckoutMobileView
