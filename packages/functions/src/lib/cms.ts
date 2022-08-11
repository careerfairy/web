import { admin } from "../api/firestoreAdmin"

export const getFieldOfStudyById = async (fieldOfStudyId: string) => {
   const ref = await admin
      .firestore()
      .collection("fieldsOfStudy")
      .doc(fieldOfStudyId)
      .get()

   if (!ref.exists) {
      return null
   }

   return { ...ref.data(), id: ref.id }
}
