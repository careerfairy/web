const functions = require("firebase-functions")

const { admin } = require("./api/firestoreAdmin")
const { client } = require("./api/postmark")

const { setCORSHeaders } = require("./util")
const { emailsToRemove } = require("./misc/emailsToRemove")

exports.sendEmailToStudentOfUniversityAndField = functions.https.onRequest(
   async (req, res) => {
      setCORSHeaders(req, res)

      const recipientsGroupsAndCategories =
         req.body.recipientsGroupsAndCategories
      console.log(req.body)
      const groups = Object.keys(recipientsGroupsAndCategories)

      console.log(groups)
      let recipients = new Set()

      let snapshot = await admin
         .firestore()
         .collection("userData")
         .where("groupIds", "array-contains-any", groups)
         .get()
      console.log(snapshot.size)
      snapshot.forEach((doc) => {
         let student = doc.data()
         groups.forEach((group) => {
            let registeredGroup = student.registeredGroups.find(
               (registeredGroup) => registeredGroup.groupId === group
            )
            if (registeredGroup) {
               let categoryId = recipientsGroupsAndCategories[group].categoryId
               let selectedOptions =
                  recipientsGroupsAndCategories[group].selectedOptions
               let registeredCategory = registeredGroup.categories.find(
                  (category) => category.id === categoryId
               )
               if (
                  registeredCategory &&
                  selectedOptions.includes(
                     registeredCategory.selectedValueId
                  ) &&
                  !emailsToRemove.includes(student.userEmail) &&
                  !student.unsubscribed
               ) {
                  recipients.add(student.userEmail)
               }
            }
         })
      })
      console.log(recipients.size)
      let testEmails = ["maximilian@careerfairy.io"]
      let templates = []
      recipients.forEach((recipient) => {
         const email = {
            TemplateId: process.env.POSTMARK_TEMPLATE_GARTNER,
            From: "CareerFairy <noreply@careerfairy.io>",
            To: recipient,
            TemplateModel: {
               userEmail: recipient,
            },
         }
         templates.push(email)
      })
      let arraysOfTemplates = []
      for (index = 0; index < templates.length; index += 500) {
         myChunk = templates.slice(index, index + 500)
         // Do something if you want with the group
         arraysOfTemplates.push(myChunk)
      }
      console.log(arraysOfTemplates.length)
      arraysOfTemplates.forEach((arrayOfTemplates) => {
         client.sendEmailBatchWithTemplates(arrayOfTemplates).then(
            (response) => {
               console.log(
                  `Successfully sent email to ${arrayOfTemplates.length}`
               )
            },
            (error) => {
               console.error(
                  `Error sending email to ${arrayOfTemplates.length}`,
                  error
               )
            }
         )
      })
   }
)
