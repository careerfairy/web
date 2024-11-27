import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
   LivestreamSecureToken,
} from "@careerfairy/shared-lib/livestreams"
import { MAX_RECORDING_HOURS } from "@careerfairy/shared-lib/livestreams/recordings"
import { WriteBatch } from "firebase-admin/firestore"
import { firestore } from "../api/firestoreAdmin"
import { livestreamsRepo } from "../api/repositories"
import { addMinutesDate, delay, removeMinutesDate } from "../util"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function retryOperation<T>(operation: () => Promise<T>): Promise<T> {
   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
         return await operation()
      } catch (error) {
         if (attempt === MAX_RETRIES) throw error
         console.warn(
            `Operation failed, retrying (${attempt}/${MAX_RETRIES})...`
         )
         await delay(RETRY_DELAY)
      }
   }
   throw new Error("Max retries reached")
}

export const livestreamGetSecureToken = async (
   id: string,
   breakoutRoomId?: string
): Promise<LivestreamSecureToken | null> => {
   let documentSnap: any = firestore.collection("livestreams").doc(id)

   if (breakoutRoomId) {
      documentSnap = documentSnap
         .collection("breakoutRooms")
         .doc(breakoutRoomId)
   }

   documentSnap = await documentSnap
      .collection("tokens")
      .doc("secureToken")
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()
}

export const livestreamGetRecordingToken = async (
   id: string,
   breakoutRoomId?: string
) => {
   let documentSnap: any = firestore.collection("livestreams").doc(id)

   if (breakoutRoomId) {
      documentSnap = documentSnap
         .collection("breakoutRooms")
         .doc(breakoutRoomId)
   }

   documentSnap = await documentSnap
      .collection("recordingToken")
      .doc("token")
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()
}

export const livestreamUpdateRecordingToken = async (
   id: string,
   data: any,
   breakoutRoomId?: string
) => {
   let ref = firestore.collection("livestreams").doc(id)

   if (breakoutRoomId) {
      ref = ref.collection("breakoutRooms").doc(breakoutRoomId)
   }

   return ref.collection("recordingToken").doc("token").set(data)
}

export const livestreamSetIsRecording = async (
   id: string,
   value = true,
   breakoutRoomId?: string
) => {
   let ref = firestore.collection("livestreams").doc(id)

   if (breakoutRoomId) {
      ref = ref.collection("breakoutRooms").doc(breakoutRoomId)
   }

   return ref.update({
      isRecording: value,
   })
}

export const getStreamsByDate = async (
   filterStartDate: Date,
   filterEndDate: Date
): Promise<LivestreamEvent[]> => {
   return firestore
      .collection("livestreams")
      .where("start", ">=", filterStartDate)
      .where("start", "<=", filterEndDate)
      .where("test", "==", false)
      .where("hidden", "==", false)
      .get()
      .then((querySnapshot) => {
         return querySnapshot.docs?.map(
            (doc) =>
               ({
                  id: doc.id,
                  ...doc.data(),
               } as LivestreamEvent)
         )
      })
}

/**
 * Get all the streams filtered by starting date and with all the registered students for each stream.
 *
 */
export const getStreamsByDateWithRegisteredStudents = async (
   filterStartDate: Date,
   filterEndDate: Date
): Promise<LiveStreamEventWithUsersLivestreamData[]> => {
   return firestore
      .collection("livestreams")
      .where("start", ">=", filterStartDate)
      .where("start", "<=", filterEndDate)
      .where("test", "==", false)
      .get()
      .then((querySnapshot) => {
         const streams = querySnapshot.docs?.map(
            (doc) =>
               ({
                  id: doc.id,
                  ...doc.data(),
               } as LivestreamEvent)
         )

         return addUsersDataOnStreams(streams)
      })
}

/**
 * Add all registered students to the correspondent streams
 *
 */
const addUsersDataOnStreams = async (
   streams: LivestreamEvent[] = []
): Promise<LiveStreamEventWithUsersLivestreamData[]> => {
   const formattedStreams = []
   for (const stream of streams) {
      const collection = await firestore
         .collection("livestreams")
         .doc(stream.id)
         .collection("userLivestreamData")
         .get()

      const usersLivestreamData = collection.docs?.map((doc) => doc.data())

      formattedStreams.push({ ...stream, usersLivestreamData })
   }

   return formattedStreams
}

/**
 * Update all the successfully sent reminders for each livestream
 */
export const updateLiveStreamsWithEmailSent = (
   batch: WriteBatch,
   emailsToSave
) => {
   Object.values(emailsToSave).forEach((email: any) => {
      const { streamId, reminderKey, chunks } = email

      const ref = firestore.collection("livestreams").doc(streamId)

      batch.update(ref, {
         [`reminderEmailsSent.${reminderKey}`]: chunks,
      })
   })
}

/**
 * Update livestreams that have started but have not finished after 4 hours
 */
export const updateUnfinishedLivestreams = async () => {
   const dateNowLess4Hours = removeMinutesDate(
      new Date(),
      60 * MAX_RECORDING_HOURS
   )

   const batch = firestore.batch()
   const updatedLivestreams: LivestreamEvent[] = []

   const collection = await firestore
      .collection("livestreams")
      .where("hasStarted", "==", true)
      .where("hasEnded", "==", false)
      .where("test", "==", false)
      .where("start", "<=", dateNowLess4Hours)
      .get()

   collection.docs?.forEach((doc) => {
      const event = doc.data() as LivestreamEvent

      const startDatePlusDuration = addMinutesDate(
         event.start.toDate(),
         event.duration
      )

      if (startDatePlusDuration <= new Date()) {
         const toUpdate: Partial<LivestreamEvent> = {
            hasStarted: false,
            hasEnded: true,
            isRecording: false,
         }

         batch.update(doc.ref, toUpdate)

         updatedLivestreams.push({
            id: doc.id,
            ...event,
            ...toUpdate,
         })
      }
   })

   await batch.commit()

   return updatedLivestreams
}

/**
 * Retrieves registration status for multiple live streams for a given user.
 * @param streams - Array of LivestreamEvent objects.
 * @param userId - User ID to check registration status for.
 * @returns Promise resolving to an array of boolean values indicating registration status.
 */
const getRegistrationStatus = async (
   streams: LivestreamEvent[],
   userId: string
): Promise<boolean[]> => {
   if (!userId) {
      return streams.map(() => false)
   }

   return Promise.all(
      streams.map((stream) =>
         retryOperation(() =>
            livestreamsRepo.isUserRegistered(stream.id, userId)
         )
      )
   )
}

/**
 * Filters an array of live streams to include only those the user is registered for.
 * @param streams - Array of LivestreamEvent objects to filter.
 * @param userId - User ID to check registration status for.
 * @returns Promise resolving to an array of LivestreamEvent objects the user is registered for.
 */
export const filterRegisteredLiveStreams = async (
   streams: LivestreamEvent[],
   userId: string
): Promise<LivestreamEvent[]> => {
   const registrationStatus = await getRegistrationStatus(streams, userId)
   return streams.filter((_, index) => registrationStatus[index])
}
