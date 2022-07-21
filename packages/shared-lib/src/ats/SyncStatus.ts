import { MergeSyncStatus } from "./MergeResponseTypes"
import { BaseModel } from "../BaseModel"

export class SyncStatus extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly model: string,
      public readonly status: string,
      public readonly isInitialSync: boolean,
      public readonly lastSync?: Date,
      public readonly nextSync?: Date
   ) {
      super()
   }

   static createFromMerge(status: MergeSyncStatus) {
      return new SyncStatus(
         status.model_id,
         status.model_name,
         status.status,
         status.is_initial_sync,
         status.last_sync_start ? new Date(status.last_sync_start) : null,
         status.next_sync_start ? new Date(status.next_sync_start) : null
      )
   }

   static createFromPlainObject(obj: SyncStatus) {
      return new SyncStatus(
         obj.id,
         obj.model,
         obj.status,
         obj.isInitialSync,
         obj.lastSync ? new Date(obj.lastSync) : null,
         obj.nextSync ? new Date(obj.nextSync) : null
      )
   }

   serializeToPlainObject() {
      return {
         ...this,
         lastSync: this.lastSync?.toISOString(),
         nextSync: this.nextSync?.toISOString(),
      }
   }
}
