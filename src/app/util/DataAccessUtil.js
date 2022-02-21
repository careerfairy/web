import axios from "axios"
import DateUtil from "./DateUtil"

export default class DataAccessUtil {
   static sendDashboardInvite(recipientEmail, userData, group, invite_link) {
      return axios({
         method: "post",
         url:
            "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendDashboardInviteEmail",
         data: {
            recipientEmail: recipientEmail,
            sender_first_name: userData.firstName,
            group_name: group.universityName,
            invite_link: invite_link,
         },
      })
   }
   static sendBasicTemplateEmail({ values, emails, senderEmail, templateId }) {
      const testingEmails = ["kadirit@hotmail.com"]

      const dataObj = {
         title: values.title,
         summary: values.summary,
         companyLogoUrl: values.companyLogoUrl,
         illustrationImageUrl: values.illustrationImageUrl,
         eventUrl: values.eventUrl,
         subject: values.subject,
         start: values.start,
         emails: testingEmails,
         senderEmail,
         templateId,
      }
      const localUrl =
         "http://localhost:5001/careerfairy-e1fd9/us-central1/sendBasicTemplateEmail"
      const prodUrl =
         "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendBasicTemplateEmail"
      return axios({
         method: "post",
         url: localUrl,
         data: dataObj,
      })
   }

   static sendDraftApprovalRequestEmail(
      adminsInfo,
      senderName,
      stream,
      submitTime,
      senderEmail
   ) {
      // TODO Update the cloud function to send the sender an email of the draft they submitted
      return axios({
         method: "post",
         url:
            "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendDraftApprovalRequestEmail",
         data: {
            adminsInfo: adminsInfo,
            sender_name: senderName,
            livestream_title: stream.title,
            livestream_company_name: stream.company,
            submit_time: submitTime,
            sender_email: senderEmail,
         },
      })
   }
}
