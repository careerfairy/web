import { Identifiable } from "../commonTypes"

export interface FieldOfStudy extends Identifiable {
   name: string
}

export interface LevelOfStudy extends FieldOfStudy {}
