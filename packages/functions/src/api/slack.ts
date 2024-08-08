import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import axios, { AxiosPromise } from "axios"
import { firestore } from "firebase-admin"
import { DateTime } from "luxon"
import { getCount } from "../util/firestore-admin"

export const notifyLivestreamStarting = async (webhookUrl, livestreamObj) => {
   const link = makeLivestreamEventDetailsUrl(livestreamObj.id)

   const registeredUsersCountQuery = firestore()
      .collection("livestreams")
      .doc(livestreamObj.id)
      .collection("userLivestreamData")
      .where("registered.date", "!=", null)

   const talentPoolCountQuery = firestore()
      .collection("livestreams")
      .doc(livestreamObj.id)
      .collection("userLivestreamData")
      .where("talentPool.date", "!=", null)

   const registeredUsersCount = await getCount(registeredUsersCountQuery)
   const talentPoolCount = await getCount(talentPoolCountQuery)

   const body = {
      Company: livestreamObj.company,
      Speakers: livestreamObj.speakers?.length,
      Duration: `${livestreamObj.duration} minutes`,
      "Registered Users": registeredUsersCount,
      "Talent Pool": talentPoolCount,
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
