import { admin } from "../api/firestoreAdmin"
import {
   LivestreamEvent,
   LiveStreamEventWithRegisteredStudents,
} from "@careerfairy/shared-lib/dist/livestreams"
import { ReminderData } from "../reminders"

export const livestreamGetById = async (id) => {
   const documentSnap = await admin
      .firestore()
      .collection("livestreams")
      .doc(id)
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return {
      ...documentSnap.data(),
      id: id,
   }
}

export const livestreamGetSecureToken = async (id, breakoutRoomId?) => {
   let documentSnap: any = admin.firestore().collection("livestreams").doc(id)

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
   let documentSnap: any = admin.firestore().collection("livestreams").doc(id)

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
   let ref = admin.firestore().collection("livestreams").doc(id)

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
   let ref = admin.firestore().collection("livestreams").doc(id)

   if (breakoutRoomId) {
      ref = ref.collection("breakoutRooms").doc(breakoutRoomId)
   }

   return ref.update({
      isRecording: value,
   })
}

/**
 * Get all the streams filtered by starting date and with all the registered students for each stream.
 *
 */
export const getStreamsByDateWithRegisteredStudents = (
   filterStartDate: Date,
   filterEndDate: Date
): Promise<LiveStreamEventWithRegisteredStudents[]> => {
   return admin
      .firestore()
      .collection("livestreams")
      .where("start", ">=", filterStartDate)
      .where("start", "<=", filterEndDate)
      .get()
      .then((querySnapshot) => {
         const streams = querySnapshot.docs?.map(
            (doc) =>
               ({
                  id: doc.id,
                  ...doc.data(),
               } as LivestreamEvent)
         )

         return addRegisteredStudentsFieldOnStreams(streams)
      })
}

/**
 * Add all registered students to the correspondent streams
 *
 */
const addRegisteredStudentsFieldOnStreams = async (
   streams: LivestreamEvent[] = []
): Promise<LiveStreamEventWithRegisteredStudents[]> => {
   const formattedStreams = []
   for (const stream of streams) {
      const collection = await admin
         .firestore()
         .collection("livestreams")
         .doc(stream.id)
         .collection("registeredStudents")
         .get()

      const registeredStudents = collection.docs?.map((doc) => doc.data())
      formattedStreams.push({ ...stream, registeredStudents })
   }

   return formattedStreams
}

/**
 * Update {reminderEmailsSent} value on livestream DB with the specific reminder email that was sent
 *
 */
export const updateLiveStreamWithEmailSent = (
   stream: LiveStreamEventWithRegisteredStudents,
   reminder: ReminderData
): Promise<admin.firestore.WriteResult> => {
   throw new Error("error")

   const { id, reminderEmailsSent } = stream
   const { livestreamKey } = reminder

   const fieldToUpdate = {
      ...reminderEmailsSent,
      [livestreamKey]: true,
   }

   return admin
      .firestore()
      .collection("livestreams")
      .doc(id)
      .update({ reminderEmailsSent: fieldToUpdate })
}
