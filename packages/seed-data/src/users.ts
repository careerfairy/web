import { auth, firestore } from "./lib/firebase"
import { capitalizeFirstLetter } from "./utils/utils"
import { UserData } from "@careerfairy/shared-lib/dist/users"

interface UserSeed {
   /**
    * Creates a user on firebase auth (already verified) and a corresponding
    * userData document
    *
    * @param email The password will be the string on the left side of the @
    * @param extraData fields that will be stored on the userData document
    */
   createUser(email: string, extraData?: UserData): Promise<UserData>
   deleteUser(email: string): Promise<any>
}

class UserFirebaseSeed implements UserSeed {
   /**
    * Creates a user on firebase auth (already verified) and a corresponding
    * userData document
    *
    * @param email email, the password will be "password"
    * @param extraData fields that will be stored on the userData document
    */
   async createUser(email: string, extraData?: UserData) {
      const username = email.split("@")[0]
      const userRecord = await auth.createUser({
         email: email,
         password: "password",
         emailVerified: true,
      })

      const userData = Object.assign(
         {
            authId: userRecord.uid,
            id: email,
            firstName: capitalizeFirstLetter(username),
            lastName: "Doe",
            userEmail: email,
            university: {
               name: "Other",
               code: "other",
            },
            universityCountryCode: "CH",
            unsubscribed: false,
         },
         extraData
      )

      await firestore.collection("userData").doc(email).set(userData)

      return userData
   }

   async deleteUser(email: string) {
      const userSnap = await firestore.collection("userData").doc(email).get()
      const authId = userSnap.data()?.authId
      const promises: Promise<any>[] = [
         firestore.collection("userData").doc(email).delete(),
      ]
      if (authId) {
         promises.push(auth.deleteUser(authId))
      }
      return Promise.all(promises)
   }
}

const instance: UserSeed = new UserFirebaseSeed()

export default instance
