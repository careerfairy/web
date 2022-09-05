import { GroupATSAccountDocument } from "./groups"

export class GroupATSAccount {
   constructor(
      public readonly groupId: string,
      public readonly id: string,
      public readonly name: string,
      public readonly image?: string,
      public readonly slug?: string,
      public readonly lastFetchedAt?: Date,
      public readonly firstSyncCompletedAt?: Date
   ) {}

   static createFromDocument(account: GroupATSAccountDocument) {
      return new GroupATSAccount(
         account.groupId,
         account.id,
         account.merge.integration_name,
         account.merge.image,
         account.merge.slug,
         account.merge.lastFetchedAt?.toDate(),
         account.merge.firstSyncCompletedAt?.toDate()
      )
   }

   isFirstSyncComplete() {
      return Boolean(this.firstSyncCompletedAt)
   }
}
