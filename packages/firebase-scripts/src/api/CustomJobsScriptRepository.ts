import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/src/customJobs/CustomJobRepository"
import { CustomJob } from "@careerfairy/shared-lib/src/customJobs/customJobs"
import { DataWithRef } from "../util/types"

export interface ICustomJobScriptsRepository extends ICustomJobRepository {
   getAllCustomJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJob>[]>
}

export class CustomJobScriptsRepository
   extends FirebaseCustomJobRepository
   implements ICustomJobScriptsRepository
{
   async getAllCustomJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, CustomJob>[]> {
      throw "Not implemented yet"
   }
}
