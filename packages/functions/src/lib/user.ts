import { FieldValue, firestore } from "../api/firestoreAdmin"

export const userGetByEmail = async (email) => {
   const documentSnap = await firestore.collection("userData").doc(email).get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()
}

export const userUpdateFields = (userDataId: string, fields) => {
   const docRef = firestore.collection("userData").doc(userDataId)

   return docRef.update(fields)
}

export const userIncrementField = (userDataId, field, amount) => {
   return userUpdateFields(userDataId, {
      [field]: FieldValue.increment(amount),
   })
}

export const userAddEntryToArrayField = (userDataId, field, entry) => {
   return userUpdateFields(userDataId, {
      [field]: FieldValue.arrayUnion(entry),
   })
}

// update user flag to display the jobs tab
// this should be removed in the future when the feature is fully rolled out
export const userSetHasJobApplications = async (userId) => {
   return firestore
      .collection("userData")
      .doc(userId)
      .update({ hasJobApplications: true })
}
