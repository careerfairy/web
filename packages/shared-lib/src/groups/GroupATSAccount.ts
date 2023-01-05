import { GroupATSAccountDocument } from "./groups"
import { MergeExtraRequiredData } from "../ats/merge/MergeResponseTypes"

export class GroupATSAccount {
   constructor(
      public readonly groupId: string,
      public readonly id: string,
      public readonly name: string,
      public readonly image?: string,
      public readonly slug?: string,
      public readonly lastFetchedAt?: Date,
      public readonly firstSyncCompletedAt?: Date,
      public readonly applicationTestCompletedAt?: Date,
      public readonly extraRequiredData?: MergeExtraRequiredData
   ) {}

   static createFromDocument(account: GroupATSAccountDocument) {
      return new GroupATSAccount(
         account.groupId,
         account.id,
         account.merge.integration_name,
         account.merge.image,
         account.merge.slug,
         account.merge.lastFetchedAt?.toDate(),
         account.merge.firstSyncCompletedAt?.toDate(),
         account.merge.applicationTestCompletedAt?.toDate(),
         account.merge.extraRequiredData
      )
   }

   isFirstSyncComplete() {
      return Boolean(this.firstSyncCompletedAt)
   }

   isApplicationTestComplete() {
      return Boolean(this.applicationTestCompletedAt)
   }

   /**
    * Check if this account is ready to be associated with a livestream
    */
   isReady() {
      return this.isFirstSyncComplete() && this.isApplicationTestComplete()
   }
}
