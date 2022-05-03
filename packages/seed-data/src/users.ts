import { auth, firestore } from "./lib/firebase"
import { CreateRequest } from "firebase-admin/auth"

import { capitalizeFirstLetter, getRandomInt } from "./utils/utils"
import { UserData } from "@careerfairy/shared-lib/dist/users"

interface UserSeed {
   /**
    * Creates a user on firebase auth (already verified) and a corresponding
    * userData document
    *
    * @param email The password will be the string on the left side of the @
    * @param extraUserData fields that will be stored on the userData document
    * @param extraAuthData
    */
   createUser(
      email: string,
      extraUserData?: UserData,
      extraAuthData?: CreateRequest
   ): Promise<UserData>
   getUserData(email: string): Promise<UserData | null>
   deleteUser(email: string): Promise<any>
}

class UserFirebaseSeed implements UserSeed {
   /**
    * Creates a user on firebase auth (already verified) and a corresponding
    * userData document
    *
    * @param email email, the password will be "password"
    * @param extraUserData fields that will be stored on the userData document
    * @param extraAuthData
    */
   async createUser(
      email: string,
      extraUserData?: UserData,
      extraAuthData?: CreateRequest
   ) {
      const pinCode = getRandomInt(9999)

      const username = email.split("@")[0]
      const users = await auth.listUsers(10)
      const oldUser = users.users.find((user) => user.email === email)
      if (oldUser) {
         await auth.deleteUser(oldUser.uid)
      }
      const userRecord = await auth.createUser({
         email: email,
         password: "password",
         emailVerified: true,
         ...extraAuthData,
      })

      const userData = Object.assign(
         {
            authId: userRecord.uid,
            id: email,
            firstName: capitalizeFirstLetter(username),
            validationPin: pinCode,
            lastName: "Doe",
            userEmail: email,
            university: {
               name: "Other",
               code: "other",
            },
            universityCountryCode: "CH",
            unsubscribed: false,
         },
         extraUserData
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

   async getUserData(email: string) {
      const userSnap = await firestore.collection("userData").doc(email).get()
      return userSnap.exists ? (userSnap.data() as UserData) : null
   }
}

const instance: UserSeed = new UserFirebaseSeed()

export default instance
