import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { RegisteredLivestreams, UserData } from "@careerfairy/shared-lib/users"
import { firestore } from "firebase-admin"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { userRepo } from "../../api/repositories"
import { ChangeType, getChangeTypeEnum } from "../../util"

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

      // on backfill, we don't need to check for registration changes, we need to update all documents
      const registrationChanged = hasRegistrationChanged(
         oldUserLivestreamData,
         newUserLivestreamData
      )

      if (!registrationChanged) {
         logger.info(
            `No registration change detected for live stream ${livestreamId} and user ${userEmail}`
         )
         return
      }

      logger.info(
         `Registration change detected for live stream ${livestreamId} and user ${userEmail}`
      )

      try {
         const userData = await userRepo.getUserDataById(userEmail)

         if (!userData || !userData.authId) {
            logger.warn(
               `Unable to process registration for user ${userEmail}: user data not found or missing authId`
            )
            return
         }

         const registeredLivestreamsRef = firestore()
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

            const registeredLivestreamsRef = firestore()
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
      updateData[`registeredLivestreams.${livestreamId}`] =
         firestore.FieldValue.delete()
      logger.info(
         `User ${newUserLivestreamData.userId} unregistered from live stream ${livestreamId}`
      )
   }

   logger.info(
      `Updated RegisteredLivestreams for user ${newUserLivestreamData.userId}`
   )

   return updateData
}
