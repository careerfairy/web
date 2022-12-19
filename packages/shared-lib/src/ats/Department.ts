import { ATSModel } from "./ATSModel"
import { MergeDepartment } from "./merge/MergeResponseTypes"

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
