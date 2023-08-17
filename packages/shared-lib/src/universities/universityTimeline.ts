import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"

export const UniversityPeriodObject = {
   Lecture: "lecture",
   Exam: "exam",
   Vacation: "vacation",
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

export interface TimelineCountry extends Identifiable {}
