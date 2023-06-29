import { fromSerializedDate } from "../BaseModel"
import { ATSModel, fromMergeDate } from "./ATSModel"
import { MergeSyncStatus } from "./merge/MergeResponseTypes"

export type SyncStatusTypes =
   | "DISABLED"
   | "DONE"
   | "FAILED"
   | "PAUSED"
   | "SYNCING"
   | "PARTIALLY_SYNCED" // Merge has failed to sync at least 1 field in this model, but some fields have successfully synced.

/**
 * Linked Account synchronization status
 * Instantiated for each Entity (Job, Recruiter, Candidate, etc)
 */
export class SyncStatus extends ATSModel {
   constructor(
      public readonly id: string,
      public readonly model: string,
      public readonly status: SyncStatusTypes,
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
         fromMergeDate(status.last_sync_start),
         fromMergeDate(status.next_sync_start)
      )
   }

   static createFromPlainObject(obj: SyncStatus) {
      return new SyncStatus(
         obj.id,
         obj.model,
         obj.status,
         obj.isInitialSync,
         fromSerializedDate(obj.lastSync),
         fromSerializedDate(obj.nextSync)
      )
   }
}
