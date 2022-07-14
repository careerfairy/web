import { Identifiable, RootCFCategory } from "../commonTypes"

export interface FieldOfStudy extends Identifiable {
   name: string
}
export interface RootFieldOfStudyCategory extends RootCFCategory {
   name: "Field of Study"
   id: "fieldOfStudy"
   options: Record<FieldOfStudy["id"], FieldOfStudy>
}
