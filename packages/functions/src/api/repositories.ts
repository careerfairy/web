import { admin } from "./firestoreAdmin"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/dist/users/UserRepository"

import {
   FirebaseMarketingUsersRepository,
   IMarketingUsersRepository,
} from "@careerfairy/shared-lib/dist/marketing/MarketingRepo"

export const userRepo: IUserRepository = new FirebaseUserRepository(
   admin.firestore() as any,
   admin.firestore.FieldValue
)

export const marketingUsersRepo: IMarketingUsersRepository =
   new FirebaseMarketingUsersRepository(
      admin.firestore() as any,
      admin.firestore.FieldValue
   )
