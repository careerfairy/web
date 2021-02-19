import axios from 'axios';
import DateUtil from './DateUtil';

export default class DataAccessUtil {

    static sendRegistrationConfirmationEmail(user, userData, livestream) {
        if (livestream.isFaceToFace) {
            return this.sendPhysicalEventEmailRegistrationConfirmation(user, userData, livestream);
        } else {
            return this.sendLivestreamEmailRegistrationConfirmation(user, userData, livestream);
        }
    } 
    
    static sendLivestreamEmailRegistrationConfirmation(user, userData, livestream) {
        return axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendLivestreamRegistrationConfirmationEmail',
            data: {
                recipientEmail: user.email,
                user_first_name: userData.firstName,
                livestream_date: DateUtil.getPrettyDate(livestream.start.toDate()),
                company_name: livestream.company,
                company_logo_url: livestream.companyLogoUrl,
                livestream_title: livestream.title,
                livestream_link: ('https://careerfairy.io/upcoming-livestream/' + livestream.id)
            }
        });
    }
    static sendDashboardInvite(recipientEmail, userData, group, invite_link) {
        return axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendDashboardInviteEmail',
            data: {
                recipientEmail: recipientEmail,
                sender_first_name: userData.firstName,
                group_name: group.universityName,
                invite_link: invite_link
            }
        });
    }

    static sendDraftApprovalRequestEmail(adminEmails, sender_name, stream, draft_stream_link, submit_time) {
        return axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendDashboardInviteEmail',
            data: {
                adminEmails: adminEmails,
                sender_name: sender_name,
                livestream_title: stream.title,
                livestream_company_name: stream.company,
                draft_stream_link: draft_stream_link,
                submit_time: submit_time,

            }
        });
    }

    static sendPhysicalEventEmailRegistrationConfirmation(user, userData, event) {
        return axios({
            method: 'post',
            url: 'https://us-central1-careerfairy-e1fd9.cloudfunctions.net/sendPhysicalEventRegistrationConfirmationEmail',
            data: {
                recipientEmail: user.email,
                user_first_name: userData.firstName,
                event_date: DateUtil.getPrettyDate(event.start.toDate()),
                company_name: event.company,
                company_logo_url: event.companyLogoUrl,
                event_title: event.title,
                event_address: event.address
            }
        });
    }
}


