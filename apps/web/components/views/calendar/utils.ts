import { UniversityPeriod } from "@careerfairy/shared-lib/universities/universityTimeline"

export type AcademicYears = {
   previousYear: {
      name: string
      start: Date
      end: Date
   }
   currentYear: {
      name: string
      start: Date
      end: Date
   }
   nextYear: {
      name: string
      start: Date
      end: Date
   }
}

export type AcademicYearType = "previousYear" | "currentYear" | "nextYear"

/**
 * Utility function to get the name, start and end date of the previous, current and next academic year
 * Might be repetitive, but allows to avoid confusion between clashing definitions of "academic year"
 * @returns name, start and end date of the previous, current and next academic year
 */
export const getAcademicYears = (): AcademicYears => {
   const currentDate = new Date()
   const year = currentDate.getFullYear()

   let academicYears: AcademicYears

   // currently January - August
   if (currentDate.getMonth() <= 7) {
      academicYears = {
         previousYear: {
            name: `${year - 2}/${year - 1}`,
            start: new Date(currentDate.getFullYear() - 2, 8, 1), // September 1st, 2 years ago
            end: new Date(currentDate.getFullYear() - 1, 7, 31), // August 31st, 1 year ago
         },
         currentYear: {
            name: `${year - 1}/${year}`,
            start: new Date(currentDate.getFullYear() - 1, 8, 1), // September, 1 year ago
            end: new Date(currentDate.getFullYear(), 7, 31), // August 31st, this year
         },
         nextYear: {
            name: `${year}/${year + 1}`,
            start: new Date(currentDate.getFullYear(), 8, 1), // September, this year
            end: new Date(currentDate.getFullYear() + 1, 7, 31), // September, 1 year later
         },
      }
   }
   // currently September - December
   else {
      academicYears = {
         previousYear: {
            name: `${year - 1}/${year}`,
            start: new Date(currentDate.getFullYear() - 1, 8, 1), // September, 1 year ago
            end: new Date(currentDate.getFullYear(), 7, 31), // August 31st, this year
         },
         currentYear: {
            name: `${year}/${year + 1}`,
            start: new Date(currentDate.getFullYear(), 8, 1), // September, this year
            end: new Date(currentDate.getFullYear() + 1, 7, 31), // August 31st, 1 year later
         },
         nextYear: {
            name: `${year + 1}/${year + 2}`,
            start: new Date(currentDate.getFullYear() + 1, 8, 1), // September, 1 year later
            end: new Date(currentDate.getFullYear() + 2, 7, 31), // August 31st, 2 years later
         },
      }
   }
   return academicYears
}

export const isPeriodInInterval = (
   period: UniversityPeriod,
   start: Date,
   end: Date
): boolean => {
   return period.end.toDate() >= start && period.start.toDate() <= end
}
