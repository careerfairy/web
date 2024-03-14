import { FormEvent, useState } from "react"
import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import StarBorderIcon from "@mui/icons-material/StarBorder"

import axios from "axios"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import BuyButtonComponent from "./BuyButtonComponent"
import { useGroup } from "layouts/GroupDashboardLayout"
import { StripeButtonProductConfig } from "data/stripe/stripe"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test public API key.
// const stripePromise = getStripe()

const styles = sxStyles({
   embeddedCheckoutWrapper: {},
   banner: {
      mx: 5,
      my: 1,
      display: "flex",
      width: "1100px%",
      padding: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "150px",
      backgroundColor: "red",
      borderRadius: "12px",
      border: "1px solid var(--Attention-Attention---600---Default, #FF1616)",
      background:
         "linear-gradient(94deg, rgba(255, 0, 0, 0.10) 1.13%, rgba(255, 0, 0, 0.00) 58.83%), rgba(255, 22, 22, 0.60)",
   },
})

type Props = {
   productConfig: StripeButtonProductConfig
}
//TODO: check unmounting
/**
 * This
 * @returns
 */
const UpgradePlanBanner = ({ productConfig }: Props) => {
   const group = useGroup()
   const [clientSecret, setClientSecret] = useState("")
   console.log("🚀 ~ CheckoutForm ~ clientSecret:", clientSecret)

   const redirectToCheckout = async (e: FormEvent) => {
      e.preventDefault()
      // Create a Checkout Session.
      const checkoutSession = await axios.post(
         "/api/checkout_sessions",
         { amount: "some amount", groupId: group.group.groupId } // BMW
      )

      if (checkoutSession.status != 200) {
         console.error(checkoutSession.statusText)
         return
      }
      console.log(
         "🚀 ~ redirectToCheckout ~ customerSessionSecret:",
         checkoutSession.data.customerSessionSecret
      )
      setClientSecret(checkoutSession.data.customerSessionSecret)

      // // Redirect to Checkout.
      // const stripe = await loadStripe()
      // const { error } = await stripe!.redirectToCheckout({
      //    // Make the id field from the Checkout Session creation API response
      //    // available to this file, so you can provide it as parameter here
      //    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
      //    sessionId: checkoutSession.data.id,
      // });
      // // If `redirectToCheckout` fails due to a browser or network
      // // error, display the localized error message to your customer
      // // using `error.message`.
      // console.warn(error.message);
   }

   return (
      <Box>
         <ConditionalWrapper condition={Boolean(clientSecret)}>
            <Box></Box>
            <Box sx={styles.embeddedCheckoutWrapper}>
               <BuyButtonComponent
                  buttonId={productConfig.buttonId}
                  publishableKey={productConfig.publishableKey}
                  clientSecret={clientSecret}
               />
            </Box>
         </ConditionalWrapper>
         <Box sx={styles.banner}>
            <Box>
               <p>
                  Your Sparks trial has ended, and theyre no longer visible to
                  the CareerFairy talent community. But the magic doesnt have to
                  stop! Upgrade now and reignite the spark to continue engaging
                  all year round with your target audience, access in-depth
                  analytics and showcase your job opportunities in an innovative
                  way. Dont let the momentum you built fade, upgrade now and
                  reignite the spark!
               </p>
            </Box>
            <Box>
               <Button
                  onClick={redirectToCheckout}
                  color="secondary"
                  sx={{ mt: 1 }}
                  startIcon={<StarBorderIcon />}
               >
                  Upgrade Now
               </Button>
            </Box>
         </Box>
      </Box>
   )
}

export default UpgradePlanBanner
