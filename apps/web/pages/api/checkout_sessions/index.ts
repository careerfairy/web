import type { NextApiRequest, NextApiResponse } from "next"
import { Stripe } from "stripe"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

//
export type StripeCustomerSessionResponseData = {
   session?: Stripe.Checkout.Session
   customerSessionSecret?: string
   message?: string
}

// TODO: check if user is admin, schema validation
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse<StripeCustomerSessionResponseData>
) {
   // TODO: Validate body
   console.log("🚀 ~ req.body:", req.body)

   // # 1 - Base Implementation
   // const session: Stripe.Checkout.SessionCreateParams = {
   //   // submit_type: 'pay',
   //   payment_method_types: ['card'],
   //   line_items: [
   //     {
   //       price: PRICE,
   //       quantity: 1,
   //     },
   //   ],
   //   mode: "subscription",
   //   ui_mode: "embedded",
   //   metadata: {
   //     groupId: "test_groupd_id"
   //   },
   //   // success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
   //   // cancel_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
   //   redirect_on_completion: "if_required"
   // };
   // const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(session)
   // stripe.custom
   // console.log("🚀 ~ checkoutSession:", checkoutSession)
   // res.status(200).json({ session: checkoutSession, message: JSON.stringify(session) })

   const query = `metadata['groupId']:'${req.body.groupId}'`
   let customer
   let createCustomer = false
   console.log("🚀 ~ query:", query)
   const customers = await stripe.customers.search({
      query: query,
   })
   console.log("🚀 ~ customers via query:", customers)

   if (customers && customers.data.length) {
      if (customers.data.length > 1)
         throw new Error(
            "Too many customers found with the same 'metadata.groupId'",
            customers
         )

      customer = customers.data.at(0)
   } else {
      createCustomer = true
   }

   if (createCustomer) {
      customer = await stripe.customers.create({
         metadata: {
            // Does not seem to work
            groupId: req.body.groupId,
         },
      })
      console.log("🚀 ~ created customer:", customer)
   }
   console.log("🚀 ~ customer:", customer)

   const customerSession = await stripe.customerSessions.create({
      customer: customer.id,
      components: {
         buy_button: {
            enabled: true,
         },
      },
   })

   res.status(200).json({
      customerSessionSecret: customerSession.client_secret,
   })
}
