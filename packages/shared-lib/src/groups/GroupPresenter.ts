import { GroupQuestion, Group } from "./groups"
import BasePresenter from "../BasePresenter"
import { UserData } from "../users"

export default class GroupPresenter extends BasePresenter<Group> {
   constructor(public readonly model: Group) {
      super(model)
   }
   isUniversity(): boolean {
      return Boolean(this.model.universityCode)
   }
   isUniversityStudent(user: UserData): boolean {
      return Boolean(
         this.model.universityCode &&
            user.university &&
            user.university.code === this.model.universityCode
      )
   }
   getUniversityQuestionsForTable(groupQuestions: GroupQuestion[]) {
      return groupQuestions.map((groupQuestion) => {
         return {
            field: `university.questions.${groupQuestion.id}.selectedOptionId`,
            title: groupQuestion.name,
            lookup: Object.keys(groupQuestion.options).reduce((acc, key) => {
               acc[key] = groupQuestion.options[key].name
               return acc
            }, {}),
         }
      })
   }
}
