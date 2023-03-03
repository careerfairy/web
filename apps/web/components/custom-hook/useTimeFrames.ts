import { v4 as uuid } from "uuid"

const now = new Date()

const sevenDays = new Date().setDate(new Date().getDate() - 7)
const twoWeeks = new Date().setDate(new Date().getDate() - 14)

const fourWeeks = new Date().setDate(new Date().getDate() - 28)

const thirtyDays = new Date().setMonth(new Date().getMonth() - 1)
const twoMonths = new Date().setMonth(new Date().getMonth() - 2)

const fourMonths = new Date().setMonth(new Date().getMonth() - 4)
const eightMonths = new Date().setMonth(new Date().getMonth() - 8)

const sixMonths = new Date().setMonth(new Date().getMonth() - 6)

const oneYear = new Date().setFullYear(new Date().getFullYear() - 1)
const twoYears = new Date().setFullYear(new Date().getFullYear() - 2)
const threeYears = new Date().setFullYear(new Date().getFullYear() - 3)
const fourYears = new Date().setFullYear(new Date().getFullYear() - 4)
const sixYears = new Date().setFullYear(new Date().getFullYear() - 6)
const eightYears = new Date().setFullYear(new Date().getFullYear() - 8)

export interface TimeFrame {
   name: string
   /*
    * The date time frame in past tense format
    * */
   pastName: string
   /*
    * The date in milliseconds since epoch
    * */
   date: number
   id: string
}

export interface GlobalTimeFrame {
   name: string
   /*
    * The date in milliseconds since epoch
    * */
   globalDate: number
   timeFrames: TimeFrame[]
   id: string
   /*
    * The date in milliseconds since epoch
    * */
   double: number
}
const timeFrames: TimeFrame[] = [
   {
      name: "4 Years",
      pastName: "4 years",
      date: fourYears,
      id: uuid(),
   },
   {
      name: "2 Years",
      pastName: "2 years",
      date: twoYears,
      id: uuid(),
   },
   {
      name: "1 Year",
      pastName: "year",
      date: oneYear,
      id: uuid(),
   },
   {
      name: "6 Months",
      pastName: "6 months",
      date: sixMonths,
      id: uuid(),
   },
   {
      name: "4 Months",
      pastName: "4 months",
      date: fourMonths,
      id: uuid(),
   },
   {
      name: "2 Months",
      pastName: "2 months",
      date: twoMonths,
      id: uuid(),
   },
   {
      name: "month",
      pastName: "month",
      date: thirtyDays,
      id: uuid(),
   },
   {
      name: "week",
      pastName: "week",
      date: sevenDays,
      id: uuid(),
   },
]

const globalTimeFrames: GlobalTimeFrame[] = [
   {
      globalDate: fourYears,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= fourYears),
      name: "4 years",
      id: uuid(),
      double: eightYears,
   },
   {
      globalDate: twoYears,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= twoYears),
      name: "2 years",
      id: uuid(),
      double: fourYears,
   },
   {
      globalDate: oneYear,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= oneYear),
      name: "year",
      id: uuid(),
      double: twoYears,
   },
   {
      globalDate: sixMonths,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= sixMonths),
      name: "6 months",
      id: uuid(),
      double: oneYear,
   },
   {
      globalDate: fourMonths,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= fourMonths),
      name: "4 months",
      id: uuid(),
      double: eightMonths,
   },
   {
      globalDate: twoMonths,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= twoMonths),
      name: "2 months",
      id: uuid(),
      double: fourMonths,
   },
   {
      globalDate: thirtyDays,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= thirtyDays),
      name: "month",
      id: uuid(),
      double: twoMonths,
   },
   {
      globalDate: twoWeeks,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= twoWeeks),
      name: "2 weeks",
      id: uuid(),
      double: fourWeeks,
   },
   {
      globalDate: sevenDays,
      timeFrames: timeFrames.filter((timeOb) => timeOb.date >= sevenDays),
      name: "week",
      id: uuid(),
      double: twoWeeks,
   },
]

const useTimeFrames = () => {
   // Will add some logic later on
   return { globalTimeFrames }
}

export default useTimeFrames
