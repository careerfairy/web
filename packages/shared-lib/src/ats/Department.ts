import { MergeDepartment } from "./MergeResponseTypes"
import { ATSModel } from "./ATSModel"

export class Department extends ATSModel {
   constructor(public readonly id: string, public readonly name: string) {
      super()
   }

   static createFromMerge(dep: MergeDepartment) {
      return new Department(dep.id, dep.name)
   }

   static createFromPlainObject(dep: Department) {
      return new Department(dep.id, dep.name)
   }
}
