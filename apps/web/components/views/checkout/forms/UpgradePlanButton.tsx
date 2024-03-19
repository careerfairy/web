import { FormEvent, useCallback, useState } from "react"
import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"

import axios from "axios"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import BuyButtonComponent from "./BuyButtonComponent"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Star } from "react-feather"
import { useDispatch } from "react-redux"
import { openGroupPlansDialog } from "store/reducers/groupPlanReducer"

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
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      color: "white",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
   },
})

type Props = {
   text: string
   icon: React.ReactNode
}
//TODO: check unmounting
const UpgradeSparksPlanButton = ({ text, icon }: Props) => {
   const dispatch = useDispatch()
   const group = useGroup()
   const [clientSecret, setClientSecret] = useState("")

   const buttonText = text ? text : "Upgrade Now"
   console.log("🚀 ~ CheckoutForm ~ clientSecret:", clientSecret)

   const handleOpen = useCallback(() => {
      dispatch(openGroupPlansDialog())
   }, [dispatch])

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
   console.log(
      "🚀 ~ redirectToCheckout ~ redirectToCheckout:",
      redirectToCheckout
   )
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
         <Button
            // onClick={redirectToCheckout}
            onClick={handleOpen}
            sx={styles.checkoutButton}
            startIcon={icon || <Star strokeWidth={3} />}
         >
            {buttonText}
         </Button>
      </Box>
   )
}

export default UpgradeSparksPlanButton
