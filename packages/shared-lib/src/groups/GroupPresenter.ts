import BasePresenter from "../BasePresenter"
import { Group, GroupATSAccount } from "./groups"

// TODO: delete if not used
export default class GroupPresenter extends BasePresenter<Group> {
   public atsAccounts: GroupATSAccount[]

   setATSAccounts(accounts: GroupATSAccount[]) {
      this.atsAccounts = accounts
   }
}
