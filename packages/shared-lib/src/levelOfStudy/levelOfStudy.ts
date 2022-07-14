import { Identifiable, RootCFCategory } from "../commonTypes"

export interface LevelOfStudy extends Identifiable {
   name: string
}

export interface RootLevelOfStudyCategory extends RootCFCategory {
   name: "Level of Study"
   id: "levelOfStudy"
   options: Record<LevelOfStudy["id"], LevelOfStudy>
}
