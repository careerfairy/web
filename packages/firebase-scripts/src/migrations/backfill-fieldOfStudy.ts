import { firestore } from "../lib/firebase"
import { UserData } from "@careerfairy/shared-lib/dist/users"

export default async function main() {
   // get all users
   const userSnaps = await firestore.collection("userData").get()
   for (const userSnap of userSnaps.docs) {
      const userData = userSnap.data() as UserData
      const userId = userSnap.id
      const user = {
         ...userData,
         id: userId,
      }
      console.log("-> user", user)
   }
}
