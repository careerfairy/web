import React from 'react';
import {v4 as uuid} from "uuid";

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
const fourYears = new Date().setFullYear(new Date().getFullYear() - 4)

const timeFrames = [
    {
        name: "2 Years",
        pastName: "2 years",
        date: twoYears,
        id: uuid()
    },
    {
        name: "1 Year",
        pastName: "year",
        date: oneYear,
        id: uuid()
    },
    {
        name: "6 Months",
        pastName: "6 months",
        date: sixMonths,
        id: uuid()
    },
    {
        name: "4 Months",
        pastName: "4 months",
        date: fourMonths,
        id: uuid()
    },
    {
        name: "2 Months",
        pastName: "2 months",
        date: twoMonths,
        id: uuid()
    },
    {
        name: "month",
        pastName: "month",
        date: thirtyDays,
        id: uuid()
    },
    {
        name: "week",
        pastName: "week",
        date: sevenDays,
        id: uuid()
    },
]

const globalTimeFrames = [
    {
        globalDate: twoYears,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= twoYears),
        name: "2 years",
        id: uuid(),
        double: fourYears
    },
    {
        globalDate: oneYear,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= oneYear),
        name: "year",
        id: uuid(),
        double: twoYears
    },
    {
        globalDate: sixMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= sixMonths),
        name: "6 months",
        id: uuid(),
        double: oneYear
    },
    {
        globalDate: fourMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= fourMonths),
        name: "4 months",
        id: uuid(),
        double: eightMonths
    },
    {
        globalDate: twoMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= twoMonths),
        name: "2 months",
        id: uuid(),
        double: fourMonths
    },
    {
        globalDate: thirtyDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= thirtyDays),
        name: "month",
        id: uuid(),
        double: twoMonths
    },
    {
        globalDate: twoWeeks,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= twoWeeks),
        name: "2 weeks",
        id: uuid(),
        double: fourWeeks
    },
    {
        globalDate: sevenDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= sevenDays),
        name: "week",
        id: uuid(),
        double: twoWeeks
    },
]


const useTimeFrames = () => {
    // Will add some logic later on
    return {globalTimeFrames}
};

export default useTimeFrames;
