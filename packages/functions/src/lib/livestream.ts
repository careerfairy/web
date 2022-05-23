import { admin } from "../api/firestoreAdmin"

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

export const livestreamGetSecureToken = async (id, breakoutRoomId = null) => {
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
   breakoutRoomId = null
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
