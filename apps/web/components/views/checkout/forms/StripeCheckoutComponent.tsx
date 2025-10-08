import {
   EmbeddedCheckout,
   EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import getStripe from "data/stripe/stripe"

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
         <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
         </EmbeddedCheckoutProvider>
      </ConditionalWrapper>
   )
}

export default StripeCheckoutComponent
