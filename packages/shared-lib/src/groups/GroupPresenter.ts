import { Group } from "./groups"
import { GroupATSAccount } from "./GroupATSAccount"

export const ATS_MAX_LINKED_ACCOUNTS = 2

export class GroupPresenter {
   public atsAccounts: GroupATSAccount[]

   constructor(
      public readonly id: string,
      public readonly description: string,
      public readonly logoImage: string,
      public readonly adminEmails: string[],
      public readonly universityName?: string
   ) {}

   setAtsAccounts(accounts: GroupATSAccount[]) {
      this.atsAccounts = accounts
   }

   atsAllowLinkNewAccounts() {
      return this.atsAccounts.length < ATS_MAX_LINKED_ACCOUNTS
   }

   static createFromDocument(group: Group) {
      return new GroupPresenter(
         group.groupId,
         group.description,
         group.logoUrl,
         group.adminEmails,
         group.universityName
      )
   }
}
