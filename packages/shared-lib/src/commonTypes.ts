import { LevelOfStudy } from "./levelOfStudy"
import { FieldOfStudy } from "./fieldOfStudy"

/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

export interface RootCFCategory {
   name: "Level of Study" | "Field of Study"
   id: "levelOfStudy" | "fieldOfStudy"
   options: Record<string, FieldOfStudy | LevelOfStudy>
}
