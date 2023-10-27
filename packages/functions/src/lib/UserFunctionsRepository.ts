import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import { DateTime } from "luxon"
import { Change } from "firebase-functions"
import { firestore } from "firebase-admin"
import DocumentSnapshot = firestore.DocumentSnapshot
import {
   CustomJob,
   pickPublicDataFromCustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/groups/customJobs"
import * as functions from "firebase-functions"

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(): Promise<UserData[]>
   syncCustomJobDataToUser(customJob: Change<DocumentSnapshot>): Promise<void>
   getGroupFollowers(groupId: string): Promise<CompanyFollowed[]>
}

export class UserFunctionsRepository
   extends FirebaseUserRepository
   implements IUserFunctionsRepository
{
   async getSubscribedUsers(): Promise<UserData[]> {
      const earlierThan = DateTime.now().minus({ months: 18 }).toJSDate()

      const data = await this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("lastActivityAt", ">=", earlierThan)
         .get()

      return mapFirestoreDocuments(data)
   }

   async syncCustomJobDataToUser(
      customJobChange: Change<DocumentSnapshot>
   ): Promise<void> {
      if (!customJobChange.after.exists) {
         // Custom job was deleted, so we don't need to do nothing
         return
      }

      const batch = this.firestore.batch()
      const newCustomJob = customJobChange.after.data() as CustomJob

      const updatedCustomJob: PublicCustomJob =
         pickPublicDataFromCustomJob(newCustomJob)

      functions.logger.log(
         `Sync CustomJobApplicants with updated job ${updatedCustomJob.id}.`
      )

      const applicants = newCustomJob.applicants || []

      applicants.forEach((applicant) => {
         const ref = this.firestore
            .collection("userData")
            .doc(applicant)
            .collection("customJobApplications")
            .doc(newCustomJob.id)

         batch.update(ref, { job: updatedCustomJob })
      })

      return void batch.commit()
   }

   async getGroupFollowers(groupId: string): Promise<CompanyFollowed[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("companiesUserFollows")
         .where("id", "==", groupId)
         .get()

      if (!querySnapshot.empty) {
         return querySnapshot.docs?.map((doc) => doc.data() as CompanyFollowed)
      }

      return []
   }
}
