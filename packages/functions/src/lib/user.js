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

exports.userAddPoints = (email, points) => {
   return userIncrementField(email, "points", points)
}

exports.userIncrementReferralsCount = (email) => {
   return userIncrementField(email, "referralsCount", 1)
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
