import axios from "axios";
import DateUtil from "./DateUtil";
import dayjs from "dayjs";

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
      });
   }
   static sendBasicTemplateEmail({ values, emails }, senderEmail) {
      const start = DateUtil.getRelativeDate(values.startDate);
      const testingEmails = [
         "habib@careerfairy.io",
         "kadirit@hotmail.com",
         "maximilian@careerfairy.io",
      ];

      const dataObj = {
         title: values.title,
         summary: values.summary,
         companyLogoUrl: values.companyLogoUrl,
         illustrationImageUrl: values.illustrationImageUrl,
         eventUrl: values.eventUrl,
         subject: values.subject,
         start,
         emails: testingEmails,
         senderEmail,
      };

      return axios({
         method: "post",
         url:
            "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendBasicTemplateEmail",
         data: dataObj,
      });
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
      });
   }

   static sendNewlyPublishedEventEmail({
      adminsInfo,
      senderName,
      stream,
      submitTime,
      senderEmail,
   }) {
      return axios({
         method: "post",
         url:
            "https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendNewlyPublishedEventEmail",
         data: {
            adminsInfo: adminsInfo,
            sender_name: senderName,
            livestream_title: stream.title,
            livestream_company_name: stream.company,
            submit_time: submitTime,
            sender_email: senderEmail,
         },
      });
   }
}
