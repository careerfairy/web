import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { info, log } from "firebase-functions/logger"
import { HttpsError, onRequest } from "firebase-functions/v2/https"
import { onSchedule, ScheduleOptions } from "firebase-functions/v2/scheduler"
import { FieldValue, firestore } from "./api/firestoreAdmin"
import { groupRepo, livestreamsRepo, notificationService } from "./api/repositories"
import { CUSTOMERIO_EMAIL_TEMPLATES } from "./lib/notifications/EmailTypes"
import { addMinutesDate } from "./util"

// Buffer time to ensure we catch all streams that need promotion emails
const promotionBufferMinutes = 20

// Range of time to look for streams (in minutes)
const promotionScheduleRange = 1440 // 24 hour window

/**
 * Configuration for the 14-day advance promotional email
 */
const Promotion14Days = {
   templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_B2B_SOCIAL_SHARE_NUDGE,
   scheduleEmailDaysBefore: 14,
   promotionUtmCampaign: "14day-promotion",
   // 14 days before the livestream starts
   getStartDate: () => addMinutesDate(new Date(), promotionBufferMinutes + (14 * 24 * 60)),
} as const

const scheduleOptions = {
   memory: "512MiB",
   timeoutSeconds: 540,
   schedule: "0 10 * * *", // Run daily at 10:00 AM CET to check for streams needing promotion
   timeZone: "Europe/Zurich",
} as const satisfies ScheduleOptions

/**
 * Runs daily at 10:00 AM CET and does the following:
 *  - Fetches livestreams that will start in 14 days (with buffer)
 *  - Sends promotional emails to all group admins for these streams
 */
export const schedule14DayPromotionEmails = onSchedule(
   scheduleOptions,
   async () => {
      log(`Current time: ${new Date().toLocaleString()}`)

      const fromDate = Promotion14Days.getStartDate()
      const toDate = addMinutesDate(fromDate, promotionScheduleRange)

      // Streams that will start in 14 days
      const streams = await getStreamsByDateForPromotion(fromDate, toDate)

      return handlePromotionEmails(streams)
   }
)

/**
 * Test the promotion emails by running them manually
 * Can be used for testing with specific date ranges
 */
export const manualPromotionEmails = onRequest(
   {
      memory: scheduleOptions.memory,
      timeoutSeconds: scheduleOptions.timeoutSeconds,
   },
   async (req, res) => {
      const daysFromNow = parseInt(req.query.daysFromNow as string) || 14

      const fromDate = addMinutesDate(new Date(), daysFromNow * 24 * 60)
      const toDate = addMinutesDate(fromDate, 24 * 60) // 1 day window

      const streams = await getStreamsByDateForPromotion(fromDate, toDate)

      await handlePromotionEmails(streams)

      res.status(200).send(
         `Promotion emails scheduled for ${streams.length} streams starting in ${daysFromNow} days`
      )
   }
)

/**
 * Fetches livestreams that need promotional emails sent
 */
const getStreamsByDateForPromotion = async (
   filterStartDate: Date,
   filterEndDate: Date
): Promise<LivestreamEvent[]> => {
   const snapshot = await firestore
      .collection("livestreams")
      .where("start", ">=", filterStartDate)
      .where("start", "<=", filterEndDate)
      .where("test", "==", false)
      .where("hidden", "==", false)
      .get()

   return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
   })) as LivestreamEvent[]
}

/**
 * Handles sending promotional emails for the given streams
 */
const handlePromotionEmails = async (streams: LivestreamEvent[]) => {
   if (streams.length === 0) {
      log(`No streams found for 14-day promotion, skipping`)
      return
   }

   log(
      `Found ${streams.length} livestreams (${streams
         .map((s) => s.id)
         .join(", ")}) for 14-day promotion emails`
   )

   try {
      for (const stream of streams) {
         await sendPromotionEmailsForStream(stream)
      }
   } catch (error) {
      log(`Error handling 14-day promotion emails`, error)
      throw new HttpsError("unknown", error)
   }
}

/**
 * Sends promotional emails to all group admins for a specific stream
 */
const sendPromotionEmailsForStream = async (stream: LivestreamEvent) => {
   try {
      // Check if promotion email has already been sent for this stream
      const promotionEmailSent = await checkIfPromotionEmailSent(stream.id)
      
      if (promotionEmailSent) {
         log(`14-day promotion email already sent for stream ${stream.id}`)
         return
      }

      // Get all group admin info for this stream
      const adminsInfo = await livestreamsRepo.getAllGroupAdminInfoByStream(stream.id)

      if (adminsInfo.length === 0) {
         log(`No group admins found for stream ${stream.id}`)
         return
      }

      // Get the group information for banner image
      const groups = await groupRepo.getGroupsByIds(stream.groupIds)
      const group = groups.find((g) => !g.universityCode) || groups[0]

      log(`Sending 14-day promotion emails to ${adminsInfo.length} admins for stream ${stream.id}`)

      // Send emails to all group admins
      await notificationService.sendEmailNotifications(
         adminsInfo.map((admin) => ({
            templateId: CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_B2B_SOCIAL_SHARE_NUDGE,
            templateData: {
               dashboardUrl: addUtmTagsToLink({
                  link: admin.eventDashboardLink,
                  campaign: Promotion14Days.promotionUtmCampaign,
               }),
               livestream: {
                  company: stream.company,
                  companyLogoUrl: stream.companyLogoUrl,
                  companyBannerImageUrl: group?.bannerImageUrl || stream.backgroundImageUrl,
                  title: stream.title,
                  url: addUtmTagsToLink({
                     link: admin.nextLivestreamsLink,
                     campaign: Promotion14Days.promotionUtmCampaign,
                  }),
               },
            },
            identifiers: {
               email: admin.email,
            },
            to: admin.email,
         }))
      )

      // Mark that the promotion email has been sent for this stream
      await markPromotionEmailSent(stream.id)

      info(`Successfully sent 14-day promotion emails for stream ${stream.id}`)
   } catch (e) {
      log(`Error sending promotion emails for stream ${stream.id}:`, e)
      throw e
   }
}

/**
 * Checks if a 14-day promotion email has already been sent for this stream
 */
const checkIfPromotionEmailSent = async (streamId: string): Promise<boolean> => {
   try {
      const doc = await firestore
         .collection("livestreams")
         .doc(streamId)
         .get()

      const data = doc.data()
      return data?.promotionEmailsSent?.fourteenDayPromotion === true
   } catch (error) {
      log(`Error checking promotion email status for stream ${streamId}:`, error)
      return false
   }
}

/**
 * Marks that a 14-day promotion email has been sent for this stream
 */
const markPromotionEmailSent = async (streamId: string): Promise<void> => {
   try {
      await firestore
         .collection("livestreams")
         .doc(streamId)
         .update({
            "promotionEmailsSent.fourteenDayPromotion": true,
            "promotionEmailsSent.fourteenDayPromotionSentAt": FieldValue.serverTimestamp(),
         })
   } catch (error) {
      log(`Error marking promotion email as sent for stream ${streamId}:`, error)
      throw error
   }
}