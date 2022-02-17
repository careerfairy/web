const functions = require("firebase-functions");
const { client } = require("./api/postmark");
const { createNestedArrayOfTemplates } = require("./util");
const { emailsToRemove } = require("./misc/emailsToRemove");

exports.sendBasicTemplateEmail = functions.https.onCall(
   async (data, context) => {
      const {
         title,
         summary,
         companyLogoUrl,
         illustrationImageUrl,
         eventUrl,
         subject,
         start,
         emails,
         senderEmail,
         // Stick to server side/cloud function templateId for now
         templateId,
      } = data;

      let emailsArray =
         emails.filter((email) => !emailsToRemove.includes(email)) || [];
      if (senderEmail) {
         emailsArray.push(senderEmail);
      }

      // Remove the sender email if the sender is already in the emails list
      emailsArray = [...new Set(emailsArray)];

      functions.logger.log(
         "number of emails in sendBasicTemplateEmail",
         emailsArray.length
      );

      //TODO remove before deploying to prod
      // functions.logger.log("Total emails in sendBasicTemplateEmail", emailsArray);

      // Will use the server side of the templateId for more
      // security instead of getting it from the client
      const templateIdentifier = templateId;

      const emailObjects = emailsArray.map((email) => ({
         TemplateId: templateIdentifier,
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
         },
      }));

      const nestedArrayOfEmailTemplates = createNestedArrayOfTemplates(
         emailObjects,
         500
      );
      functions.logger.log(
         "-> Total number of Batches:",
         nestedArrayOfEmailTemplates.length
      );
      let count = 0;
      for (const arrayOfTemplateEmails of nestedArrayOfEmailTemplates) {
         count += 1;
         try {
            await client
               .sendEmailBatchWithTemplates(arrayOfTemplateEmails)
               .then(
                  (response) => {
                     functions.logger.log(
                        `Successfully sent email to ${arrayOfTemplateEmails.length}`
                     );
                  },
                  (error) => {
                     functions.logger.error("error:" + error);
                     console.log("error:" + error);
                     throw new functions.https.HttpsError(
                        "unknown",
                        `Unhandled error: ${error.message}`
                     );
                  }
               );
         } catch (batchError) {
            functions.logger.error(
               `error in sending batch ${count}: ${batchError}`
            );
         }
      }
   }
);
