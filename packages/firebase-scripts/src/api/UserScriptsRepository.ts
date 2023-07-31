import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { DataWithRef } from "../util/types"

export interface IUserScriptsRepository extends IUserRepository {
   getAllUsers<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, UserData>[]>
}

export class UserScriptsRepository
   extends FirebaseUserRepository
   implements IUserScriptsRepository
{
   async getAllUsers<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, UserData>[]> {
      const users = await this.firestore.collection("userData").get()
      this.fieldValue
      return mapFirestoreDocuments<UserData, T>(users, withRef)
   }
}
