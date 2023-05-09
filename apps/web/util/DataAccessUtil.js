import axios from "axios"

export default class DataAccessUtil {
   static sendDashboardInvite(recipientEmail, userData, group, invite_link) {
      return axios({
         method: "post",
         url: "https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/sendDashboardInviteEmail_eu",
         data: {
            recipientEmail: recipientEmail,
            sender_first_name: userData.firstName,
            group_name: group.universityName,
            invite_link: invite_link,
         },
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
         url: "https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/sendDraftApprovalRequestEmail_eu",
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
