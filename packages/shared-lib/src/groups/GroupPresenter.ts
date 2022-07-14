import { CustomCategory, Group } from "./groups"
import BasePresenter from "../BasePresenter"

export default class GroupPresenter extends BasePresenter<Group> {
   constructor(public readonly model: Group) {
      super(model)
   }
   canHaveCustomCategories() {
      return Boolean(this.model.universityCode)
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
