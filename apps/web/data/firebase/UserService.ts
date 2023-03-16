import { Create } from "@careerfairy/shared-lib/commonTypes"
import {
   UserActivity,
   UserData,
   UserPublicData,
} from "@careerfairy/shared-lib/users"
import {
   doc,
   serverTimestamp,
   addDoc,
   collection,
   updateDoc,
} from "firebase/firestore"
import { errorLogAndNotify } from "util/CommonUtil"
import { FirestoreInstance } from "./FirebaseInstance"

export class UserService {
   /**
    * Create a user activity document and updates his lastActivityAt field
    */
   async createActivity(
      user: UserPublicData,
      type: UserActivity["type"]
   ): Promise<void> {
      const date = serverTimestamp()
      const activityDoc: Create<UserActivity> = {
         collection: "userActivity",
         userId: user.id,
         type,
         date: date as any,
         user,
      }

      const toUpdate: Pick<UserData, "lastActivityAt"> = {
         lastActivityAt: date as any,
      }

      const promises = [
         // new activity entry
         addDoc(
            collection(FirestoreInstance, "userData", user.id, "activities"),
            activityDoc
         ),
         // keep the userData lastActivityAt field up to date
         updateDoc(doc(FirestoreInstance, "userData", user.id), toUpdate),
      ]

      await Promise.all(promises).catch(errorLogAndNotify)
   }
}

export const userServiceInstance = new UserService()

export default UserService
