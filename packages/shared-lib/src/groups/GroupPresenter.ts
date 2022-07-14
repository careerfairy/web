import { CustomCategory, Group } from "./groups"
import BasePresenter from "../BasePresenter"
import { UserData } from "../users"

export default class GroupPresenter extends BasePresenter<Group> {
   constructor(public readonly model: Group) {
      super(model)
   }
   canHaveCustomCategories(): boolean {
      return Boolean(this.model.universityCode)
   }
   isUniversityStudent(user: UserData): boolean {
      return Boolean(
         user.university && user.university.code === this.model.universityCode
      )
   }
   getCustomCategoriesForTable(customCategories: CustomCategory[]) {
      return customCategories.map((customCategory) => {
         return {
            field: `university.categories.${customCategory.id}.selectedOptionId`,
            title: customCategory.name,
            lookup: Object.keys(customCategory.options).reduce((acc, key) => {
               acc[key] = customCategory.options[key].name
               return acc
            }, {}),
         }
      })
   }
}
