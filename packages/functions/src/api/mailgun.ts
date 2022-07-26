import { isLocalEnvironment } from "../util"
import Mailgun from "mailgun.js"
import formData = require("form-data")

const apiKey = "13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4"
const host = "https://api.eu.mailgun.net"
let domain = "mail.careerfairy.io"

// on local emulators use the sandbox environment (emails whitelisted in mailgun)
if (isLocalEnvironment()) {
   domain =
      "https://api.mailgun.net/v3/sandbox6105d057d95146d6ac6d5389bd1b44eb.mailgun.org"
   console.log("Using mailgun v2 sandbox environment")
}

const mailgun = new Mailgun(formData)

const client = mailgun.client({ username: "api", key: apiKey, url: host })

export const sendMessage = async (emailData) => {
   return client.messages.create(domain, emailData)
}
