import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"

export type UniversityPeriodType = "exam" | "vacation" | "lecture"

export interface TimelineUniversity extends Identifiable {
   name: string
   country: string
}

export interface UniversityPeriod extends Identifiable {
   type: UniversityPeriodType
   start: Timestamp
   end: Timestamp
}
