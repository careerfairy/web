import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"

export const UniversityPeriodObject = {
   Exam: "exam",
   Vacation: "vacation",
   Lecture: "lecture",
} as const

export type UniversityPeriodType =
   (typeof UniversityPeriodObject)[keyof typeof UniversityPeriodObject]

export interface TimelineUniversity extends Identifiable {
   name: string
   countryCode: string
}

export interface UniversityPeriod extends Identifiable {
   type: UniversityPeriodType
   start: Timestamp
   end: Timestamp
   timelineUniversityId: string
}
