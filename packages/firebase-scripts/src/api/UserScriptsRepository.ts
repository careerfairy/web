import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

export interface IUserScriptsRepository extends IUserRepository {
   getAllUsers(withRef?: boolean): Promise<UserData[]>
}

export class UserScriptsRepository
   extends FirebaseUserRepository
   implements IUserScriptsRepository
{
   async getAllUsers(withRef?: boolean): Promise<UserData[]> {
      const users = await this.firestore.collection("userData").get()
      return mapFirestoreDocuments<UserData>(users, withRef)
   }
}
