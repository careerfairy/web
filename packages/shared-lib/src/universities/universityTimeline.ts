import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"

export enum UniversityPeriodType {
   Exam = "exam",
   Vacation = "vacation",
   Lecture = "lecture",
}

export interface TimelineUniversity extends Identifiable {
   name: string
   country: string
}

export interface UniversityPeriod extends Identifiable {
   type: UniversityPeriodType
   start: Timestamp
   end: Timestamp
}
