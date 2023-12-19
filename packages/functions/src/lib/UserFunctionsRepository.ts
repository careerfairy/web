import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import { DateTime } from "luxon"
import {
   CustomJob,
   pickPublicDataFromCustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import * as functions from "firebase-functions"

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(): Promise<UserData[]>
   syncCustomJobDataToUser(customJob: CustomJob): Promise<void>
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

   async syncCustomJobDataToUser(customJob: CustomJob): Promise<void> {
      const batch = this.firestore.batch()

      const updatedCustomJob: PublicCustomJob =
         pickPublicDataFromCustomJob(customJob)

      const applicantsSnapshot = await this.firestore
         .collectionGroup("customJobApplicants")
         .where("id", "==", customJob.id)
         .get()

      const applicants = applicantsSnapshot.docs || []

      functions.logger.log(
         `Sync CustomJobApplicants with updated job ${updatedCustomJob.id} to ${applicants.length} applicants.`
      )
      applicants.forEach((applicant) => {
         const ref = this.firestore
            .collection("userData")
            .doc(applicant.id)
            .collection("customJobApplications")
            .doc(customJob.id)

         batch.update(ref, { job: updatedCustomJob })
      })

      return void batch.commit()
   }

   async getGroupFollowers(groupId: string): Promise<CompanyFollowed[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("companiesUserFollows")
         .where("id", "==", groupId)
         .get()

      return querySnapshot.docs?.map((doc) => doc.data() as CompanyFollowed)
   }
}
