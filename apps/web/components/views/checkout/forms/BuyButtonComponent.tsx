import * as React from "react"

type Props = {
   clientSecret: string
   buttonId: string
   publishableKey: string
}

function BuyButtonComponent({ clientSecret, buttonId, publishableKey }: Props) {
   // Paste the stripe-buy-button snippet in your React component
   return (
      <stripe-buy-button
         buy-button-id={buttonId}
         publishable-key={publishableKey}
         customer-session-client-secret={clientSecret}
      ></stripe-buy-button>
   )
}

export default BuyButtonComponent
