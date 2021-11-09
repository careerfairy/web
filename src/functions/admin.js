const functions = require("firebase-functions");
const { setHeaders } = require("./util");
const { client } = require("./api/postmark");

exports.sendBasicTemplateEmail = functions.https.onRequest(async (req, res) => {
   setHeaders(req, res);

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
   } = req.body;

   let emailsArray = emails || [];
   emailsArray.push(senderEmail);

   // Remove the sender email if the sender is already in the emails list
   emailsArray = [...new Set(emailsArray)];

   functions.logger.log(
      "number of emails in sendBasicTemplateEmail",
      emailsArray.length
   );

   //TODO remove before deploying to prod
   functions.logger.log("Total emails in sendBasicTemplateEmail", emailsArray);

   // Will use the server side of the templateId for more
   // security instead of getting it from the client
   const templateIdentifier = 25653565;

   const emailObjects = emailsArray.map((email) => ({
      TemplateId: templateIdentifier,
      From: "CareerFairy <noreply@careerfairy.io>",
      To: email,
      TemplateModel: {
         title,
         summary,
         start,
         eventUrl,
         companyLogoUrl,
         illustrationImageUrl,
         userEmail: email,
         subject,
      },
   }));

   client.sendEmailBatchWithTemplates(emailObjects).then(
      (responses) => {
         responses.forEach((response) =>
            functions.logger.log(
               "sent sendBasicTemplateEmail email with response:",
               response
            )
         );
         return res.send(200);
      },
      (error) => {
         functions.logger.error("error:" + error);
         console.log("error:" + error);
         return res.status(400).send(error);
      }
   );
});
