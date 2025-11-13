import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import axios, { AxiosPromise } from "axios"
import { firestore } from "firebase-admin"
import { DateTime } from "luxon"
import { getCount } from "../util/firestore-admin"

/**
 * Get the count of all fields of study
 * This is used to detect when "any field of study" was selected
 */
const getFieldsOfStudyCount = async (): Promise<number> => {
   const fieldsQuery = firestore().collection("fieldsOfStudy")
   return await getCount(fieldsQuery)
}

export const notifyLivestreamStarting = async (
   webhookUrl: string,
   livestreamObj: LivestreamEvent
) => {
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

export const notifyLivestreamCreated = async (
   webhookUrl: string,
   publisherEmailOrName: string,
   livestreamObj: LivestreamEvent
) => {
   const adminLink = `https://www.careerfairy.io/group/${livestreamObj.author?.groupId}/admin/events?eventId=${livestreamObj.id}`
   const eventLink = makeLivestreamEventDetailsUrl(livestreamObj.id)

   // Format country codes to country names using the map
   const formattedCountries = livestreamObj.companyCountries?.length
      ? livestreamObj.companyCountries
           .map((code) => universityCountryMap[code] || code)
           .join(", ")
      : null

   // Check if "any field of study" was selected
   // When "any field of study" is selected, the backend saves ALL fields
   // We detect this by comparing with the actual count from Firestore
   const totalFieldsCount = await getFieldsOfStudyCount()
   const fieldsOfStudyText =
      livestreamObj.targetFieldsOfStudy?.length === totalFieldsCount
         ? "Any field of study"
         : livestreamObj.targetFieldsOfStudy?.length
         ? livestreamObj.targetFieldsOfStudy
              .map((field) => field.name)
              .join(", ")
         : null

   const body = {
      "Start Date": formatEventStartDate(livestreamObj.start?.toDate?.()),
      Publisher: publisherEmailOrName,
      Company: livestreamObj.company,
      Speakers: livestreamObj.speakers?.length,
      Duration: `${livestreamObj.duration} minutes`,
      ...(formattedCountries
         ? {
              "Client Country": formattedCountries,
           }
         : {}),
      ...(fieldsOfStudyText
         ? {
              "Target Fields of Study": fieldsOfStudyText,
           }
         : {}),
      ...(livestreamObj.targetLevelsOfStudy?.length
         ? {
              "Target Level of Study": livestreamObj.targetLevelsOfStudy
                 .map((level) => level.name)
                 .join(", "),
           }
         : {}),
      "Live Stream Details": eventLink,
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
   webhookUrl: string,
   livestreamObj: LivestreamEvent,
   downloadLink: string
): AxiosPromise => {
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

export const notifySparksTrialStarted = (
   webhookUrl: string,
   params: {
      groupName: string
      groupId: string
      startedAt: Date
      expiresAt?: Date | null
      startedBy?: string | null
   }
) => {
   const adminLink = `https://www.careerfairy.io/group/${params.groupId}/admin/content/sparks`

   const body: Record<string, string> = {
      Group: params.groupName,
      Plan: "trial",
      "Started At": formatEventStartDate(params.startedAt),
      ...(params.expiresAt
         ? { "Expires At": formatEventStartDate(params.expiresAt) }
         : {}),
      ...(params.startedBy ? { "Started By": params.startedBy } : {}),
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Sparks Trial Started:\n*${params.groupName}*`,
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
               alt_text: "Sparks Trial",
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Admin Sparks Page",
                  },
                  url: adminLink,
                  style: "primary",
               },
            ],
         },
      ],
   })
}

/**
 * Sends a Slack notification when an offline event is published.
 *
 * @returns Promise that resolves when the notification is sent
 */
export const notifyOfflineEventPublished = (
   webhookUrl: string,
   params: {
      companyName: string
      publisherName: string
      publisherEmail: string
      eventTitle: string
      eventId: string
      eventDate: Date
      groupId: string
      remainingCredits: number
      eventImageUrl: string
   }
) => {
   const eventLink = `https://www.careerfairy.io/portal?offline-event=${params.eventId}`
   const groupAdminOfflineEvents = `https://www.careerfairy.io/group/${params.groupId}/admin/content/offline-events`

   const body: Record<string, string> = {
      "Company Name": params.companyName,
      Publisher: `${params.publisherName} (${params.publisherEmail})`,
      "Event Date": formatEventStartDate(params.eventDate),
      "Remaining Credits": params.remainingCredits.toString(),
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Offline Event Published: *<${eventLink}|${params.eventTitle}>*`,
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
               image_url: params.eventImageUrl,
               alt_text: "Offline Event Published",
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Admin Events Page",
                  },
                  url: groupAdminOfflineEvents,
                  style: "primary",
               },
            ],
         },
      ],
   })
}

/**
 * Sends a Slack notification when a group purchases offline event credits.
 *
 * @returns Promise that resolves when the notification is sent
 */
export const notifyOfflineEventPurchased = (
   webhookUrl: string,
   params: {
      groupName: string
      groupLogoUrl: string
      groupId: string
      quantityPurchased: number
      updatedCredits: number
      previousCredits: number
      customerEmail: string
      customerName: string
   }
) => {
   const groupAdminOfflineEvents = `https://www.careerfairy.io/group/${params.groupId}/admin/content/offline-events`

   const body: Record<string, string> = {
      "Credits purchased": params.quantityPurchased.toString(),
      "Previous Credits": params.previousCredits.toString(),
      "Updated Credits": params.updatedCredits.toString(),
      "Bought by": `${params.customerName} (${params.customerEmail})`,
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `Offline Event Credits Purchased: *${params.groupName}*`,
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
               image_url: params.groupLogoUrl,
               alt_text: `${params.groupName} Logo`,
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Admin Events Page",
                  },
                  url: groupAdminOfflineEvents,
                  style: "primary",
               },
            ],
         },
      ],
   })
}

/**
 * Sends a Slack notification when increasing bought offline events fails.
 *
 * @returns Promise that resolves when the notification is sent
 */
export const notifyOfflineEventIncreaseFailed = (
   webhookUrl: string,
   params: {
      groupName: string
      groupLogoUrl: string
      groupId: string
      currentCredits: string
      expectedCredits: string
      quantityToIncrease: string
      customerEmail: string
      customerName: string
   }
) => {
   const groupAdminOfflineEvents = `https://www.careerfairy.io/group/${params.groupId}/admin/content/offline-events`

   const body: Record<string, string> = {
      "Current Credits": params.currentCredits,
      "Expected Credits": params.expectedCredits,
      "Failed to increase by": params.quantityToIncrease,
      "Purchased by": `${params.customerName} (${params.customerEmail})`,
   }

   return generateRequest(webhookUrl, {
      blocks: [
         {
            type: "section",
            text: {
               type: "mrkdwn",
               text: `🚨 Offline Event Credits Increase Failed: *${params.groupName}*`,
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
               image_url: params.groupLogoUrl,
               alt_text: `${params.groupName} Logo`,
            },
         },
         {
            type: "actions",
            elements: [
               {
                  type: "button",
                  text: {
                     type: "plain_text",
                     text: "Admin Events Page",
                  },
                  url: groupAdminOfflineEvents,
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
