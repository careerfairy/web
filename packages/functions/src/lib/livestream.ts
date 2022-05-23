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

export const livestreamGetSecureToken = async (id) => {
   const documentSnap = await admin
      .firestore()
      .collection("livestreams")
      .doc(id)
      .collection("tokens")
      .doc("secureToken")
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()
}

export const livestreamUpdateRecordingToken = async (id, data) => {
   return admin
      .firestore()
      .collection("livestreams")
      .doc(id)
      .collection("recordingToken")
      .doc("token")
      .set(data)
}

export const livestreamSetIsRecording = async (id, value = true) => {
   return admin.firestore().collection("livestreams").doc(id).update({
      isRecording: value,
   })
}
