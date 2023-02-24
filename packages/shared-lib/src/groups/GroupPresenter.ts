import { Group, GroupQuestion } from "./groups"
import { GroupATSAccount } from "./GroupATSAccount"
import { UserData } from "../users"

export const ATS_MAX_LINKED_ACCOUNTS = 1

export class GroupPresenter {
   public atsAccounts: GroupATSAccount[]

   constructor(
      public readonly id: string,
      public readonly description: string,
      public readonly logoUrl: string,
      public readonly universityName?: string,
      public readonly universityCode?: string
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
         group.universityName,
         group.universityCode
      )
   }

   isUniversity(): boolean {
      return Boolean(this.universityCode)
   }

   isUniversityStudent(user: UserData): boolean {
      return Boolean(
         this.universityCode &&
            user.university &&
            user.university.code === this.universityCode
      )
   }
   getUniversityQuestionsForTable(groupQuestions: GroupQuestion[]) {
      return groupQuestions.map((groupQuestion) => {
         return {
            field: `university.questions.${groupQuestion.id}.answerId`,
            title: groupQuestion.name,
            lookup: Object.keys(groupQuestion.options).reduce((acc, key) => {
               acc[key] = groupQuestion.options[key].name
               return acc
            }, {}),
         }
      })
   }

   getCompanyPageImagePath() {
      return `company-pages/${this.id}/photos}`
   }
}
