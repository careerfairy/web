import { isLocalEnvironment } from "@careerfairy/shared-lib/utils"
import Mailgun from "mailgun.js"
import { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { processInBatches } from "../util"
import formData = require("form-data")
import functions = require("firebase-functions")

const apiKey = "13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4"
const host = "https://api.eu.mailgun.net"
let domain = "mail.careerfairy.io"

// on local emulators use the sandbox environment (emails whitelisted in mailgun)
/**
 * TODO: Check better way of locally testing, as using this domain results in 405 - Method Not Allowed even if we update the testing recipients
 * on mailgun.
 */
if (isLocalEnvironment()) {
   domain =
      "https://api.mailgun.net/v3/sandbox6105d057d95146d6ac6d5389bd1b44eb.mailgun.org"
   console.log("Using mailgun sandbox environment")
}

const mailgun = new Mailgun(formData)

const client = mailgun.client({ username: "api", key: apiKey, url: host })

export const sendMessage = (emailData: MailgunMessageData) => {
   return client.messages.create(domain, emailData)
}

/**
 * Using individual sending with property 'h:X-Mailgun-Variables' as batch sending seems to have issues inferring the template variables.
 * More info: https://stackoverflow.com/questions/64409355/mailgun-batch-sending-doesnt-work-with-personalised-data
 */
export const sendIndividualMessages = (emailData: MailgunMessageData) => {
   const recipientVariables = JSON.parse(emailData["recipient-variables"])

   const attach = recipientVariables.attachment
      ? [
           {
              filename: recipientVariables.attachment.name,
              data: recipientVariables.attachment.content, // Raw string content
              contentType: recipientVariables.attachment.contentType, // Use provided MIME type
           },
        ]
      : []

   delete recipientVariables.attachment
   const recipients = Object.keys(recipientVariables)

   return processInBatches(
      recipients,
      50,
      (userEmail) => {
         return client.messages.create(domain, {
            ...emailData,
            to: userEmail,
            "h:X-Mailgun-Variables": JSON.stringify(
               recipientVariables[userEmail]
            ),
            attachment: attach,
         })
      },
      functions.logger
   ).catch((err) => {
      functions.logger.error("Error processing mailgun email in", err)
   })
}
