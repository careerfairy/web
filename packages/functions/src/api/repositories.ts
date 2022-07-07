import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"
import { admin } from "./firestoreAdmin"

export const groupRepo: IGroupRepository = new FirebaseGroupRepository(
   admin.firestore() as any,
   admin.firestore.FieldValue
)
