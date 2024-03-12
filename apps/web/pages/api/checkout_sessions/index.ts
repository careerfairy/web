import type { NextApiRequest, NextApiResponse } from "next"
import { Stripe } from "stripe"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

//
// const PRICE = process.env.SPARKS_ONE_YEAR_PRICE_ID!
type ResponseData = {
   session?: Stripe.Checkout.Session
   customerSessionSecret?: string
   message?: string
}

// TODO: check if user is admin
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse<ResponseData>
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

   // const query = `metadata['groupId']:'${req.body.groupId}'`

   //   console.log("🚀 ~ query:", query)
   //   const customers = await stripe.customers.search({
   //     query: query,
   //   });
   let groupCustomer
   let createCustomer = false
   try {
      groupCustomer = await stripe.customers.retrieve(req.body.groupId)

      // What if customer is deleted ?
      if (!groupCustomer || groupCustomer.deleted) {
         createCustomer = true
      }
   } catch (e) {
      console.log("🚀 ~ error retrieving customer:", e)

      createCustomer = true
   }

   if (createCustomer) {
      groupCustomer = await stripe.customers.create({
         id: req.body.groupId,
         metadata: {
            // Does not seem to work
            groupId: req.body.groupId,
         },
      })
      console.log("🚀 ~ created customer:", groupCustomer)
   }
   console.log("🚀 ~ customer:", groupCustomer)

   const customerSession = await stripe.customerSessions.create({
      customer: groupCustomer.id,
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
