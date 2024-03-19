import * as React from "react"

type Props = {
   clientSecret: string
   buttonId: string
   publishableKey: string
}

function BuyButtonComponent({ clientSecret, buttonId, publishableKey }: Props) {
   return (
      <stripe-buy-button
         buy-button-id={buttonId}
         publishable-key={publishableKey}
         customer-session-client-secret={clientSecret}
      ></stripe-buy-button>
   )
}

export default BuyButtonComponent
