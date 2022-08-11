import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { admin } from "./firestoreAdmin"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { IATSRepository } from "@careerfairy/shared-lib/src/ats/IATSRepository"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"
import {
   FirebaseMarketingUsersRepository,
   IMarketingUsersRepository,
} from "@careerfairy/shared-lib/dist/marketing/MarketingRepo"

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   admin.firestore() as any,
   admin.firestore.FieldValue
)

export const userRepo: IUserRepository = new FirebaseUserRepository(
   admin.firestore() as any,
   admin.firestore.FieldValue
)

export const atsRepo = (
   apiKey: string,
   accountToken: string
): IATSRepository => {
   return new MergeATSRepository(apiKey, accountToken)
}
export const marketingUsersRepo: IMarketingUsersRepository =
   new FirebaseMarketingUsersRepository(
      admin.firestore() as any,
      admin.firestore.FieldValue
   )
