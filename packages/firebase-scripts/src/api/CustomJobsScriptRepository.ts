import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/dist/customJobs/CustomJobRepository"
import {
   CustomJob,
   CustomJobApplicant,
} from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { DataWithRef } from "../util/types"

export interface ICustomJobScriptsRepository extends ICustomJobRepository {
   getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]>
   getAllCustomJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJob>[]>
}

export class CustomJobScriptsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobScriptsRepository
{
   async getAllJobApplications<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJobApplicant>[]> {
      const customJobs = await this.firestore
         .collection("jobApplications")
         .orderBy("job.createdAt", "desc")
         .get()
      return mapFirestoreDocuments<CustomJobApplicant, T>(customJobs, withRef)
   }

   async getAllCustomJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJob>[]> {
      const customJobs = await this.firestore.collection("customJobs").get()

      return mapFirestoreDocuments<CustomJob, T>(customJobs, withRef)
   }
}
