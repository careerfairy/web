import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import {
   FirebaseOfflineEventRepository,
   IOfflineEventRepository,
} from "@careerfairy/shared-lib/offline-events/OfflineEventRepository"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"

export interface IOfflineEventFunctionsRepository
   extends IOfflineEventRepository {
   syncGroupDataToOfflineEvent(groupId: string, group: Group): Promise<void>
}

export class OfflineEventFunctionsRepository
   extends FirebaseOfflineEventRepository
   implements IOfflineEventFunctionsRepository
{
   async syncGroupDataToOfflineEvent(
      groupId: string,
      group: Group
   ): Promise<void> {
      const offlineEventsSnap = await this.firestore
         .collection("offlineEvents")
         .where("group.id", "==", groupId)
         .get()

      const batch = this.firestore.batch()
      const publicGroup = pickPublicDataFromGroup(group)

      offlineEventsSnap.forEach((doc) => {
         const updateData: Pick<OfflineEvent, "group"> = {
            group: publicGroup,
         }

         batch.update(doc.ref, updateData)
      })

      await batch.commit()
   }
}
