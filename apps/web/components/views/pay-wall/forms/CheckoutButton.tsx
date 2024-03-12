import { FormEvent, useState } from "react"
import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import StarBorderIcon from "@mui/icons-material/StarBorder"

import axios from "axios"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import BuyButtonComponent from "./BuyButtonComponent"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test public API key.
// const stripePromise = getStripe()

const styles = sxStyles({
   embeddedCheckoutWrapper: {
      "&:first-of-type": {
         m: 100,
      },
      p: 10,
      position: "absolute",
      width: "100%",
      left: 0,
      right: 0,
      margin: "auto",
      overflow: "scroll",
      zIndex: 10,
      borderRadius: "15px",
      //    border: "solid 3px darkgrey"
   },
})

// type Props = {
//     children?: React.ReactElement,
//     customerClientSecret?: string
// }
//TODO: check unmounting
const CheckoutButton = () => {
   const [clientSecret, setClientSecret] = useState("")
   console.log("🚀 ~ CheckoutForm ~ clientSecret:", clientSecret)

   const redirectToCheckout = async (e: FormEvent) => {
      e.preventDefault()
      // Create a Checkout Session.
      const checkoutSession = await axios.post(
         "/api/checkout_sessions",
         { amount: "some amount", groupId: "yrUCEdMPNc6vz2mMXkx1" } // BMW
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
                  buttonId={
                     process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID
                  }
                  publishableKey={
                     process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  }
                  clientSecret={clientSecret}
               />
               {/* <EmbeddedCheckoutProvider stripe={stripePromise}  options={{clientSecret}} >
                    <EmbeddedCheckout className="stripeCheckout"/>
                </EmbeddedCheckoutProvider> */}
            </Box>
         </ConditionalWrapper>
         <ConditionalWrapper condition={!clientSecret}>
            <Button
               onClick={redirectToCheckout}
               color="secondary"
               sx={{ mt: 1 }}
               startIcon={<StarBorderIcon />}
            >
               Upgrade Now
            </Button>
         </ConditionalWrapper>
      </Box>
   )
}

export default CheckoutButton
