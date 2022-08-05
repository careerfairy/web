import { admin } from "../api/firestoreAdmin"

export const getFieldsOfStudy = async () => {
   const ref = await admin.firestore().collection("fieldsOfStudy").get()

   return ref.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
   }))
}
