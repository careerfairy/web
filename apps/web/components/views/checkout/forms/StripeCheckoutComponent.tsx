import * as React from "react"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import getStripe from "data/stripe/stripe"
import {
   EmbeddedCheckout,
   EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { Box } from "@mui/material"

const stripePromise = getStripe()

type Props = {
   clientSecret: string
}

const StripeCheckoutComponent = ({ clientSecret }: Props) => {
   const options = {
      // passing the client secret obtained from the server
      clientSecret: clientSecret,
   }
   return (
      <ConditionalWrapper condition={Boolean(clientSecret)}>
         <Box width={"800px"} height={"500px"}>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
               <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
         </Box>
      </ConditionalWrapper>
   )
}

export default StripeCheckoutComponent
