import {
   LivestreamEvent,
   LiveStreamEventWithUsersLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { addMinutesDate, removeMinutesDate } from "../util"
import { MAX_RECORDING_HOURS } from "@careerfairy/shared-lib/livestreams/recordings"
import { firestore } from "../api/firestoreAdmin"
import { WriteBatch } from "firebase-admin/firestore"

export const livestreamGetSecureToken = async (id, breakoutRoomId?) => {
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
   id,
   breakoutRoomId = null
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
   id,
   data,
   breakoutRoomId?
) => {
   let ref = firestore.collection("livestreams").doc(id)

   if (breakoutRoomId) {
      ref = ref.collection("breakoutRooms").doc(breakoutRoomId)
   }

   return ref.collection("recordingToken").doc("token").set(data)
}

export const livestreamSetIsRecording = async (
   id,
   value = true,
   breakoutRoomId = null
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
         batch.update(doc.ref, {
            hasStarted: false,
            hasEnded: true,
            isRecording: false,
         })
      }
   })

   return batch.commit()
}
