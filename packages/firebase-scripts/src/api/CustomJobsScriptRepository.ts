import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/dist/customJobs/CustomJobRepository"
import { CustomJobApplicant } from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { DataWithRef } from "../util/types"

export interface ICustomJobScriptsRepository extends ICustomJobRepository {
   getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]>
}

export class CustomJobScriptsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobScriptsRepository
{
   async getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]> {
      const customJobs = await this.firestore
         .collectionGroup("jobApplications")
         .orderBy("job.createdAt", "desc")
         .get()
      return mapFirestoreDocuments<CustomJobApplicant, T>(customJobs, withRef)
   }
}
