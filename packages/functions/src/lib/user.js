const { admin } = require("../api/firestoreAdmin")

exports.userGetByReferralCode = async (referralCode) => {
   let querySnapshot = await admin
      .firestore()
      .collection("userData")
      .where("referralCode", "==", referralCode)
      .limit(1)
      .get()

   if (querySnapshot.empty) {
      return null
   }

   return querySnapshot.docs[0].data()
}

exports.userGetByEmail = async (email) => {
   let documentSnap = await admin
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
   let docRef = admin.firestore().collection("userData").doc(userDataId)

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

exports.userIncrementStat = async (userDataId, field, amount = 1) => {
   const docRef = admin
      .firestore()
      .collection("userData")
      .doc(userDataId)
      .collection("stats")
      .doc("stats")

   const doc = await docRef.get()

   if (doc.exists) {
      return docRef.update({
         [field]: admin.firestore.FieldValue.increment(amount),
      })
   } else {
      return docRef.set({
         userId: userDataId,
         [field]: amount,
      })
   }
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
