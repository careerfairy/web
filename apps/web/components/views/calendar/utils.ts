import { UniversityPeriod } from "@careerfairy/shared-lib/universities/universityTimeline"
import { DateTime } from "luxon"
import { sxStyles } from "../../../types/commonTypes"
import { lighten } from "@mui/material/styles"

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
   const currentDate = DateTime.now()
   const currentYear = currentDate.year

   let academicYears: AcademicYears

   // currently January - August
   if (currentDate.month <= 8) {
      academicYears = {
         previousYear: {
            name: `${currentYear - 2}/${currentYear - 1}`,
            start: DateTime.local(currentYear - 2, 9, 1).toJSDate(), // 1st September
            end: DateTime.local(currentYear - 1, 8, 31).toJSDate(), // 31st August
         },
         currentYear: {
            name: `${currentYear - 1}/${currentYear}`,
            start: DateTime.local(currentYear - 1, 9, 1).toJSDate(),
            end: DateTime.local(currentYear, 8, 31).toJSDate(),
         },
         nextYear: {
            name: `${currentYear}/${currentYear + 1}`,
            start: DateTime.local(currentYear, 9, 1).toJSDate(),
            end: DateTime.local(currentYear + 1, 8, 31).toJSDate(),
         },
      }
   }
   // currently September - December
   else {
      academicYears = {
         previousYear: {
            name: `${currentYear - 1}/${currentYear}`,
            start: DateTime.local(currentYear - 1, 9, 1).toJSDate(),
            end: DateTime.local(currentYear, 8, 31).toJSDate(),
         },
         currentYear: {
            name: `${currentYear}/${currentYear + 1}`,
            start: DateTime.local(currentYear, 9, 1).toJSDate(),
            end: DateTime.local(currentYear + 1, 8, 31).toJSDate(),
         },
         nextYear: {
            name: `${currentYear + 1}/${currentYear + 2}`,
            start: DateTime.local(currentYear + 1, 9, 1).toJSDate(),
            end: DateTime.local(currentYear + 2, 8, 31).toJSDate(),
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

export const datePickerDefaultStyles = sxStyles({
   datePicker: {
      mt: "10px",
      "& .react-datepicker": {
         fontFamily: (theme) => theme.typography.fontFamily + "!important",
      },
      "& .react-datepicker-wrapper": {
         width: "100%",
      },
      "& .react-datepicker__header": {
         backgroundColor: "white",
         borderBlockColor: "transparent",
         pb: 0,
      },
      "& .react-datepicker__navigation-icon::before": {
         borderColor: "secondary.main",
      },
      "& .react-datepicker__day-names": {
         mt: "10px",
         fontWeight: 600,
      },
      "& .react-datepicker__day--selected": {
         backgroundColor: "secondary.main",
         borderRadius: "20px",
      },
      "& .react-datepicker__day--in-range": {
         backgroundColor: (theme) =>
            theme.palette.secondary.main + "!important",
         color: "white!important",
         borderRadius: "20px",
      },
      "& .react-datepicker__day--in-selecting-range": {
         backgroundColor: (theme) =>
            lighten(theme.palette.secondary.main, 0.4) + "!important",
         borderRadius: "20px",
      },
      "& .react-datepicker__day:hover": {
         backgroundColor: (theme) => lighten(theme.palette.secondary.main, 0.4),
         borderRadius: "20px",
      },
      "& .react-datepicker__day--keyboard-selected": {
         backgroundColor: "transparent",
      },
   },
})
