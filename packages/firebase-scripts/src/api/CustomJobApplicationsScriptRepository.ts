import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { FirebaseCustomJobRepository } from "@careerfairy/shared-lib/dist/customJobs/CustomJobRepository"
import { CustomJobApplicant } from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { DataWithRef } from "../util/types"

export interface ICustomJobApplicationsScriptsRepository {
   getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]>
}

export class CustomJobApplicationsScriptsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobApplicationsScriptsRepository
{
   async getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]> {
      const customJobApplications = await this.firestore
         .collectionGroup("jobApplications")
         .orderBy("job.createdAt", "desc")
         .get()
      return mapFirestoreDocuments<CustomJobApplicant, T>(
         customJobApplications,
         withRef
      )
   }
}
