import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import axios, { AxiosPromise } from "axios"
import { DateTime } from "luxon"

export const notifyLivestreamStarting = (webhookUrl, livestreamObj) => {
   const link = makeLivestreamEventDetailsUrl(livestreamObj.id)

   const body = {
      Company: livestreamObj.company,
      Speakers: livestreamObj.speakers?.length,
      Duration: `${livestreamObj.duration} minutes`,
      "Registered Users": livestreamObj.registeredUsers?.length ?? 0,
      "Talent Pool": livestreamObj.talentPool?.length ?? 0,
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Livestream starting now! :fire:\n*<${link}|${livestreamObj.title}>*`,
            },
         },
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: generateBodyStr(body),
            },
            accessory: {
               type: "image",
               image_url: livestreamObj.companyLogoUrl,
               alt_text: livestreamObj.company,
            },
         },
      ],
   })
}

export const notifyLivestreamCreated = (
   webhookUrl,
   publisherEmailOrName,
   livestreamObj
) => {
   const adminLink = `https://www.careerfairy.io/group/${livestreamObj.author?.groupId}/admin/events?eventId=${livestreamObj.id}`
   const eventLink = makeLivestreamEventDetailsUrl(livestreamObj.id)

   const body = {
      "Start Date": formatEventStartDate(livestreamObj.start.toDate()),
      Publisher: publisherEmailOrName,
      Company: livestreamObj.company,
      Speakers: livestreamObj.speakers?.length,
      Duration: `${livestreamObj.duration} minutes`,
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Livestream created:\n*${livestreamObj.title}*`,
            },
         },
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: generateBodyStr(body),
            },
            accessory: {
               type: "image",
               image_url:
                  "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/static_files%2Fcalendar.png?alt=media&token=f86c0885-7def-435e-b1d3-5dce3f75c1f6",
               alt_text: "Event Created",
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Event Details",
                  },
                  url: eventLink,
               },
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Admin Event Page",
                  },
                  url: adminLink,
                  style: "primary",
               },
            ],
         },
      ],
   })
}

export const notifyLivestreamRecordingCreated = (
   webhookUrl,
   livestreamObj,
   downloadLink
) => {
   const eventLink = makeLivestreamEventDetailsUrl(livestreamObj.id)

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Livestream Recording Complete:\n*${livestreamObj.title}*`,
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Event Details",
                  },
                  url: eventLink,
               },
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Download Recording",
                  },
                  url: downloadLink,
                  style: "primary",
               },
            ],
         },
      ],
   })
}

function formatEventStartDate(date) {
   const luxonDate = DateTime.fromJSDate(date)
   return luxonDate.toLocaleString(DateTime.DATETIME_FULL)
}

function generateBodyStr(fieldsObj) {
   let result = ""

   // eslint-disable-next-line guard-for-in
   for (const key in fieldsObj) {
      result += `*${key}:* ${fieldsObj[key]}\n`
   }

   return result
}

function generateRequest(url, body): AxiosPromise {
   // do not send slack notifications during tests in CI
   if (process.env.CI) {
      return Promise.resolve() as any
   }

   return axios({
      method: "post",
      data: body,
      url: url,
      headers: {
         "Content-Type": "application/json",
      },
   })
}
