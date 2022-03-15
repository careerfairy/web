const { admin } = require("../api/firestoreAdmin")

exports.livestreamGetById = async (id) => {
   let documentSnap = await admin
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
