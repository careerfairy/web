const { admin } = require("../api/firestoreAdmin")

exports.userGetByEmail = async (email) => {
   const documentSnap = await admin
      .firestore()
      .collection("userData")
      .doc(email)
      .get()

   if (!documentSnap.exists) {
      return null
   }

   return documentSnap.data()
}

exports.userUpdateFields = (userDataId, fields) => {
   const docRef = admin.firestore().collection("userData").doc(userDataId)

   return docRef.update(fields)
}

const userIncrementField = (userDataId, field, amount) => {
   return exports.userUpdateFields(userDataId, {
      [field]: admin.firestore.FieldValue.increment(amount),
   })
}

exports.userIncrementField = userIncrementField

exports.userAddEntryToArrayField = (userDataId, field, entry) => {
   return exports.userUpdateFields(userDataId, {
      [field]: admin.firestore.FieldValue.arrayUnion(entry),
   })
}

// update user flag to display the jobs tab
// this should be removed in the future when the feature is fully rolled out
exports.userSetHasJobApplications = async (userId) => {
   return admin
      .firestore()
      .collection("userData")
      .doc(userId)
      .update({ hasJobApplications: true })
}
