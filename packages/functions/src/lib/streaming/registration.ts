import { toUnixTimestamp } from "@careerfairy/shared-lib/customerio"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { RegisteredLivestreams, UserData } from "@careerfairy/shared-lib/users"
import * as admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { userRepo } from "../../api/repositories"
import { ChangeType, getChangeTypeEnum } from "../../util"
import {
   clearRegistrationData,
   updateParticipationData,
   updateRegistrationData,
   updateSeenData,
} from "../customerio/relationships"

export const onUserRegistration = onDocumentWritten(
   {
      document: "livestreams/{livestreamId}/userLivestreamData/{userEmail}",
   },
   async (event) => {
      const { params } = event
      const { livestreamId, userEmail } = params

      logger.info(
         `Processing registration for live stream ${livestreamId} and user ${userEmail}`
      )

      const newUserLivestreamData =
         event.data.after.data() as UserLivestreamData
      const oldUserLivestreamData =
         event.data.before.data() as UserLivestreamData

      // Check for registration, participation, and seen data changes
      const registrationChanged = hasRegistrationChanged(
         oldUserLivestreamData,
         newUserLivestreamData
      )
      const participationChanged = hasParticipationChanged(
         oldUserLivestreamData,
         newUserLivestreamData
      )
      const seenDataChanged = hasSeenDataChanged(
         oldUserLivestreamData,
         newUserLivestreamData
      )

      if (!registrationChanged && !participationChanged && !seenDataChanged) {
         logger.info(
            `No registration, participation, or seen data change detected for live stream ${livestreamId} and user ${userEmail}`
         )
         return
      }

      logger.info(
         `Registration, participation, or seen data change detected for live stream ${livestreamId} and user ${userEmail}`
      )

      try {
         const userData = await userRepo.getUserDataById(userEmail)

         if (!userData || !userData.authId) {
            logger.warn(
               `Unable to process registration for user ${userEmail}: user data not found or missing authId`
            )
            return
         }

         // Track Customer.io relationship changes for registration and participation
         await trackCustomerIORelationships(
            livestreamId,
            oldUserLivestreamData,
            newUserLivestreamData,
            userData
         )

         const registeredLivestreamsRef = admin
            .firestore()
            .collection("registeredLivestreams")
            .doc(userData.authId)

         const registeredLivestreamsDoc = await registeredLivestreamsRef.get()

         const registeredLivestreams = getOrCreateRegisteredLivestreams(
            registeredLivestreamsDoc,
            userData
         )

         // If the document doesn't exist, create it first
         if (!registeredLivestreamsDoc.exists) {
            await registeredLivestreamsRef.set(registeredLivestreams)
         }

         const updateData = updateRegisteredLivestreams(
            livestreamId,
            newUserLivestreamData,
            userData
         )

         // Now we can always use update
         await registeredLivestreamsRef.update(updateData)

         logger.info(
            `Successfully updated registered live streams for user ${userEmail}`
         )
      } catch (error) {
         logger.error(
            `Error updating registered live streams for user ${userEmail}:`,
            error
         )
         throw error
      }
   }
)

export const syncUserInRegisteredLivestreams = onDocumentWritten(
   {
      document: "userData/{userEmail}",
   },
   async (event) => {
      const { params } = event
      const { userEmail } = params

      const changeType = getChangeTypeEnum(event)

      if (
         changeType === ChangeType.UPDATE ||
         changeType === ChangeType.CREATE
      ) {
         try {
            const newUserData = event.data.after.data() as UserData

            if (!newUserData || !newUserData.authId) {
               logger.warn(
                  `Unable to process registration for user ${userEmail}: user data not found or missing authId`
               )
               return null
            }

            const registeredLivestreamsRef = admin
               .firestore()
               .collection("registeredLivestreams")
               .doc(newUserData.authId)

            const toUpdate: Partial<RegisteredLivestreams> = {
               lastActivityAt: newUserData?.lastActivityAt || null,
               universityCountryCode: newUserData?.universityCountryCode || "",
               unsubscribed: Boolean(newUserData.unsubscribed),
               userEmail: newUserData.userEmail || newUserData.id,
               userAuthId: newUserData.authId,
               id: newUserData.authId,
            }

            await registeredLivestreamsRef.set(toUpdate, { merge: true })

            return null
         } catch (error) {
            logger.error(
               `Error updating registered live streams for user ${userEmail}:`,
               error
            )
            throw error
         }
      }
   }
)
function hasRegistrationChanged(
   oldData: UserLivestreamData,
   newData: UserLivestreamData
): boolean {
   return (
      Boolean(oldData?.registered?.date) !== Boolean(newData?.registered?.date)
   )
}

function hasParticipationChanged(
   oldData: UserLivestreamData,
   newData: UserLivestreamData
): boolean {
   return (
      Boolean(oldData?.participated?.date) !==
      Boolean(newData?.participated?.date)
   )
}

function hasSeenDataChanged(
   oldData: UserLivestreamData,
   newData: UserLivestreamData
): boolean {
   const hadSeen = Boolean(oldData?.seen?.firstSeenAt)
   const hasSeen = Boolean(newData?.seen?.firstSeenAt)

   // If seen status changed (first view or cleared)
   if (hadSeen !== hasSeen) {
      return true
   }

   // If user has seen the livestream, check if lastSeenAt or viewCount changed
   if (hasSeen) {
      return (
         oldData?.seen?.lastSeenAt?.toMillis() !==
            newData?.seen?.lastSeenAt?.toMillis() ||
         oldData?.seen?.viewCount !== newData?.seen?.viewCount
      )
   }

   return false
}

function getOrCreateRegisteredLivestreams(
   doc: FirebaseFirestore.DocumentSnapshot,
   userData: UserData | undefined
): RegisteredLivestreams | null {
   const existingData = doc.data() as RegisteredLivestreams | undefined

   if (existingData) {
      return existingData
   }

   return {
      id: userData.authId,
      userAuthId: userData.authId,
      userEmail: userData.id,
      unsubscribed: Boolean(userData?.unsubscribed),
      registeredLivestreams: {},
      lastActivityAt: userData.lastActivityAt || null,
      universityCountryCode: userData?.universityCountryCode || "",
   }
}

function updateRegisteredLivestreams(
   livestreamId: string,
   newUserLivestreamData: UserLivestreamData,
   userData: UserData
): Partial<RegisteredLivestreams> {
   const updateData: Partial<RegisteredLivestreams> = {
      unsubscribed: Boolean(userData.unsubscribed),
      lastActivityAt: userData?.lastActivityAt || null,
      universityCountryCode: userData?.universityCountryCode || "",
   }

   if (newUserLivestreamData.registered?.date) {
      updateData[`registeredLivestreams.${livestreamId}`] =
         newUserLivestreamData.registered.date
      logger.info(
         `User ${newUserLivestreamData.userId} registered for live stream ${livestreamId}`
      )
   } else {
      updateData[`registeredLivestreams.${livestreamId}`] = FieldValue.delete()
      logger.info(
         `User ${newUserLivestreamData.userId} unregistered from live stream ${livestreamId}`
      )
   }

   logger.info(
      `Updated RegisteredLivestreams for user ${newUserLivestreamData.userId}`
   )

   return updateData
}

/**
 * Tracks Customer.io relationship changes for registration, participation, and seen data
 * Updates or clears specific attribute sets while preserving the relationship for future attributes
 */
async function trackCustomerIORelationships(
   livestreamId: string,
   oldUserLivestreamData: UserLivestreamData | null,
   newUserLivestreamData: UserLivestreamData,
   userData: UserData
): Promise<void> {
   const userAuthId = userData.authId

   try {
      // Track registration, participation, and seen changes
      const wasRegistered = Boolean(oldUserLivestreamData?.registered?.date)
      const isRegistered = Boolean(newUserLivestreamData?.registered?.date)
      const wasParticipating = Boolean(
         oldUserLivestreamData?.participated?.date
      )
      const isParticipating = Boolean(newUserLivestreamData?.participated?.date)
      const hasSeen = Boolean(newUserLivestreamData?.seen?.firstSeenAt)

      // Handle registration changes
      if (!wasRegistered && isRegistered) {
         // User just registered - add registration data
         await updateRegistrationData(userAuthId, livestreamId, {
            registeredAt: toUnixTimestamp(
               newUserLivestreamData.registered?.date
            ),
            utm: newUserLivestreamData.registered?.utm,
            originSource: newUserLivestreamData.registered?.originSource,
         })
         logger.info(
            `Updated Customer.io registration data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      } else if (wasRegistered && !isRegistered) {
         // User deregistered - clear registration attributes
         await clearRegistrationData(userAuthId, livestreamId)
         logger.info(
            `Cleared Customer.io registration data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      }

      // Handle participation changes
      if (!wasParticipating && isParticipating) {
         // User just participated - add participation data
         await updateParticipationData(userAuthId, livestreamId, {
            participatedAt: toUnixTimestamp(
               newUserLivestreamData.participated?.date
            ),
            utm: newUserLivestreamData.participated?.utm,
         })
         logger.info(
            `Updated Customer.io participation data: user ${userAuthId} -> livestream ${livestreamId}`
         )
      }

      // Handle seen data changes
      if (
         hasSeenDataChanged(oldUserLivestreamData, newUserLivestreamData) &&
         hasSeen
      ) {
         // User has viewed the livestream - update seen data
         await updateSeenData(userAuthId, livestreamId, {
            firstSeenAt: toUnixTimestamp(
               newUserLivestreamData.seen?.firstSeenAt
            ),
            lastSeenAt: toUnixTimestamp(newUserLivestreamData.seen?.lastSeenAt),
            viewCount: newUserLivestreamData.seen?.viewCount,
            firstUtm: newUserLivestreamData.seen?.firstUtm,
            lastUtm: newUserLivestreamData.seen?.lastUtm,
         })
         logger.info(
            `Updated Customer.io seen data: user ${userAuthId} -> livestream ${livestreamId} (viewCount: ${newUserLivestreamData.seen?.viewCount})`
         )
      }
   } catch (error) {
      // Log error but don't fail the entire registration process
      logger.error(
         `Failed to update Customer.io relationships for user ${userAuthId} and livestream ${livestreamId}:`,
         error
      )
   }
}
