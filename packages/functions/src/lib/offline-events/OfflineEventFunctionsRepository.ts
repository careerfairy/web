import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UTMParams } from "@careerfairy/shared-lib/commonTypes"
import { UserPublicData } from "@careerfairy/shared-lib/users"
import { Firestore, Storage } from "../../api/firestoreAdmin"
import { FunctionsLogger } from "../../util"

export interface OfflineEventFunctionsRepository {
   trackOfflineEventView(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void>

   trackOfflineEventClick(
      offlineEventId: string,
      user: UserPublicData,
      utm: UTMParams | null
   ): Promise<void>
}

export class OfflineEventFunctionsRepository
   extends BaseFirebaseRepository
   implements OfflineEventFunctionsRepository
{
   constructor(
      readonly firestore: Firestore,
      readonly storage: Storage,
      readonly logger: FunctionsLogger
   ) {
      super()
   }
}
