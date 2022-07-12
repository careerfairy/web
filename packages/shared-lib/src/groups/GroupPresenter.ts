import BasePresenter from "../BasePresenter"
import { Group, GroupATSAccount } from "./groups"

export default class GroupPresenter extends BasePresenter<Group> {
   public atsAccounts: GroupATSAccount[]

   setATSAccounts(accounts: GroupATSAccount[]) {
      this.atsAccounts = accounts
   }
}
