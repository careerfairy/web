import { auth, firestore } from "./lib/firebase"
import { CreateRequest } from "firebase-admin/auth"
import { v4 as uuidv4 } from "uuid"
import * as admin from "firebase-admin"

import { capitalizeFirstLetter, getRandomInt } from "./utils/utils"
import {
   SavedRecruiter,
   UserData,
   UserDataAnalytics,
} from "@careerfairy/shared-lib/dist/users"
import { faker } from "@faker-js/faker"
import { chunkArray } from "@careerfairy/shared-lib/dist/utils"

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
      extraUserData?: Partial<UserData>,
      extraAuthData?: CreateRequest
   ): Promise<UserData>

   getUserData(email: string): Promise<UserData | null>

   deleteUser(email: string): Promise<any>

   addSavedRecruiter(
      user: UserData,
      recruiterDetails?: Partial<SavedRecruiter>
   ): Promise<SavedRecruiter>

   /*
    * This method is meant for development purposes only
    * It creates a user on firebase auth (already verified) from a userData document
    * As we are unable to import the prod auth in our dev environment, we need to re-create
    * it from the userData document
    * */
   createAuthUserFromUserData(
      userData: UserData
   ): Promise<admin.auth.UserRecord>

   createAuthUsersFromUserData(): Promise<void>
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
      extraUserData?: Partial<UserData>,
      extraAuthData?: CreateRequest
   ): Promise<UserData> {
      const pinCode = getRandomInt(9999)

      const username = email.split("@")[0]
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
      ) as UserData

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

   async addSavedRecruiter(
      user: UserData,
      recruiterDetails?: Partial<SavedRecruiter>
   ): Promise<SavedRecruiter> {
      let recruiter = {
         id: uuidv4(),
         userId: user.authId,
         livestreamId: uuidv4(),
         savedAt: null,
         livestreamDetails: {
            title: faker.lorem.sentence(),
            company: faker.company.companyName(),
            companyLogoUrl: faker.image.business(),
            start: admin.firestore.Timestamp.fromDate(faker.date.past()),
         },
         streamerDetails: {
            id: uuidv4(),
            avatar: faker.image.avatar(),
            name: faker.name.firstName(),
            linkedIn: "https://www.linkedin.com/in/john-doe/",
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            position: faker.name.jobTitle(),
            background: faker.name.jobArea(),
         },
      }

      if (recruiterDetails) {
         recruiter = Object.assign(recruiter, recruiterDetails)
      }

      // @ts-ignore
      recruiter.savedAt = admin.firestore.FieldValue.serverTimestamp()

      await firestore
         .collection("userData")
         .doc(user.userEmail)
         .collection("savedRecruiters")
         .doc(recruiter.id)
         .set(recruiter)

      return recruiter
   }

   async getUserDataAnalytics(email: string): Promise<UserDataAnalytics> {
      const userAnalyticsSnap = await firestore
         .doc(`userData/${email}/analytics/analytics`)
         .get()
      return userAnalyticsSnap.exists
         ? (userAnalyticsSnap.data() as UserDataAnalytics)
         : null
   }

   async createAuthUserFromUserData(
      userData: UserData
   ): Promise<admin.auth.UserRecord> {
      return auth.createUser({
         uid: userData.authId,
         email: userData.userEmail,
         password: "password",
         emailVerified: true,
      })
   }

   async createAuthUsersFromUserData(): Promise<void> {
      const allUserSnaps = await firestore.collection("userData").get() // Get all user snapshots

      const allUserDocs = allUserSnaps.docs.map((doc) => doc.data() as UserData) // Get all user docs

      const userChunks = chunkArray(allUserDocs, 3000) // Chunk the user docs into "n" users per chunk, to avoid hitting the node concurrent promise limit

      for (const [index, userChunk] of userChunks.entries()) {
         console.log(
            `Creating ${userChunk.length} auth users in chunk ${index + 1} of ${
               userChunks.length
            }`
         ) // Log the progress

         const promises = userChunk.map((user) =>
            this.createAuthUserFromUserData(user).catch((e) => {
               console.log(
                  `Error creating user ${user.userEmail} with uid ${user.authId}`, // Catch and log errors
                  e
               )
            })
         )

         await Promise.all(promises) // Wait for all promises to resolve
      }

      return
   }
}

const instance: UserSeed = new UserFirebaseSeed()

export default instance
