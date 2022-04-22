const { axios } = require("./axios")
const { DateTime } = require("luxon")
const { isLocalEnvironment } = require("../util")

const notifyLivestreamStarting = (webhookUrl, livestreamObj) => {
   const link = `https://www.careerfairy.io/upcoming-livestream/${livestreamObj.id}`

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

const notifyLivestreamCreated = (
   webhookUrl,
   publisherEmailOrName,
   livestreamObj
) => {
   const adminLink = `https://www.careerfairy.io/group/${livestreamObj.author?.groupId}/admin/events?eventId=${livestreamObj.id}`
   const eventLink = `https://www.careerfairy.io/upcoming-livestream/${livestreamObj.id}`

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

function formatEventStartDate(date) {
   const luxonDate = DateTime.fromJSDate(date)
   return luxonDate.toLocaleString(DateTime.DATETIME_FULL)
}

function generateBodyStr(fieldsObj) {
   let result = ""

   for (let key in fieldsObj) {
      result += `*${key}:* ${fieldsObj[key]}\n`
   }

   return result
}

function generateRequest(url, body) {
   if (isLocalEnvironment()) {
      return {}
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

module.exports = {
   notifyLivestreamStarting,
   notifyLivestreamCreated,
}
