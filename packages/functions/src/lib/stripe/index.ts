import { Stripe } from "stripe"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripeInstance: Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export default stripeInstance
