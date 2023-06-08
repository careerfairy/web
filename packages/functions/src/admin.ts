import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/bigQuery/types"
import { bigQueryRepo, userRepo } from "./api/repositories"
import {
   logAndThrow,
   userIsSignedInAndIsCFAdmin,
   validateData,
} from "./lib/validations"
import { createNestedArrayOfTemplates, generateSignature } from "./util"
import { emailsToRemove } from "./misc/emailsToRemove"
import functions = require("firebase-functions")
import { object, string } from "yup"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import config from "./config"
import { client } from "./api/postmark"
import { type TemplatedMessage } from "postmark"

export const sendBasicTemplateEmail = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 300,
      secrets: ["SIGNATURE_SECRET"],
   })
   .https.onCall(async (data, context) => {
      const {
         title,
         summary,
         companyLogoUrl,
         illustrationImageUrl,
         eventUrl,
         subject,
         start,
         testEmails,
         senderEmail,
         queryOptions,
         isForRealEmails,
         // Stick to server side/cloud function templateId for now
         templateId,
      }: {
         title: string
         summary: string
         companyLogoUrl: string
         illustrationImageUrl: string
         eventUrl: string
         subject: string
         start: string
         testEmails: string[]
         senderEmail: string
         queryOptions: BigQueryUserQueryOptions
         templateId: string
         isForRealEmails: boolean
      } = data

      let emailsArray = []
      if (senderEmail) {
         emailsArray.push(senderEmail)
      }
      if (isForRealEmails === true) {
         await userIsSignedInAndIsCFAdmin(context)
         const users = await bigQueryRepo.getUsers(
            queryOptions.page,
            false,
            queryOptions.orderBy,
            queryOptions.sortOrder,
            queryOptions?.filters
         )
         const userEmails = users.map((user) => user.userEmail).filter(Boolean)
         emailsArray = emailsArray.concat(userEmails)
      } else {
         const testEmailsArray =
            testEmails?.filter((email) => !emailsToRemove.includes(email)) || []
         emailsArray = emailsArray.concat(testEmailsArray)
      }

      // Remove the sender email if the sender is already in the emails list
      emailsArray = [...new Set(emailsArray)]

      functions.logger.info("Details of marketing email:", {
         queryOptions,
         isForRealEmails,
         testEmails,
         senderEmail,
         title,
         eventUrl,
         templateId,
         numberOfEmails: emailsArray.length,
      })

      // TODO remove before deploying to prod
      // functions.logger.log("Total emails in sendBasicTemplateEmail", emailsArray);

      // Will use the server side of the templateId for more
      // security instead of getting it from the client
      const templateIdentifier = templateId

      const emailObjects: TemplatedMessage[] = emailsArray.map((email) => ({
         TemplateId: Number(templateIdentifier),
         From: "CareerFairy <noreply@careerfairy.io>",
         To: email,
         TemplateModel: {
            title,
            summary,
            summaryArray: summary
               .split("\n")
               .map((paragraph) => ({ paragraph })),
            start,
            eventUrl,
            companyLogoUrl,
            illustrationImageUrl,
            userEmail: email,
            subject,
            newsLetterUnsubscribeLink: addUtmTagsToLink({
               link: getNewsletterUnsubscribeLink(
                  email,
                  process.env.SIGNATURE_SECRET,
                  context?.rawRequest?.headers?.origin
               ),
            }),
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
      }))

      const nestedArrayOfEmailTemplates = createNestedArrayOfTemplates(
         emailObjects,
         500
      )
      functions.logger.log(
         "-> Total number of Batches:",
         nestedArrayOfEmailTemplates.length
      )
      let count = 0
      for (const arrayOfTemplateEmails of nestedArrayOfEmailTemplates) {
         count += 1
         try {
            await client
               .sendEmailBatchWithTemplates(arrayOfTemplateEmails)
               .then(
                  () => {
                     functions.logger.log(
                        `Successfully sent email to ${arrayOfTemplateEmails.length}`
                     )
                  },
                  (error) => {
                     functions.logger.error("error:" + error)
                     console.log("error:" + error)
                     throw new functions.https.HttpsError(
                        "unknown",
                        `Unhandled error: ${error.message}`
                     )
                  }
               )
         } catch (batchError) {
            functions.logger.error(
               `error in sending batch ${count}: ${batchError}`
            )
         }
      }
   })

export const unsubscribeFromMarketingEmails = functions
   .region(config.region)
   .runWith({
      secrets: ["SIGNATURE_SECRET"],
   })
   .https.onCall(async (data) => {
      try {
         const { email, signature } = await validateData(
            data,
            object({
               email: string().email().required(),
               signature: string().required(),
            })
         )
         const actualSignature = generateSignature(
            email,
            process.env.SIGNATURE_SECRET
         )

         if (actualSignature === signature) {
            return userRepo.unsubscribeUser(email)
         } else {
            logAndThrow("Invalid signature", {
               email,
               signature,
               actualSignature,
            })
         }
      } catch (e) {
         logAndThrow("Failed to unsubscribe email", {
            data,
            error: e,
         })
      }
   })

const getNewsletterUnsubscribeLink = (
   email: string,
   secret: string,
   origin?: string
): string => {
   const signature = generateSignature(email, secret)
   const baseUrl = origin || "https://careerfairy.io"

   /*
    * encodeURIComponent is needed to encode the signature
    * because it contains special characters like + and =
    * */
   const encodedSignature = encodeURIComponent(signature)

   return `${baseUrl}/newsletter/unsubscribe/${email}?signature=${encodedSignature}`
}
