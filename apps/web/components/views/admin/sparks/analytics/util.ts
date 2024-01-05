import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { useState } from "react"

export type AbstractButtonSelect<T> = {
   [key in keyof T]: string
}

type TimeFrameMapToLabels = {
   [key in TimePeriodParams]: string
}

export const timeFrameLabels = {
   "7days": "past 7 days",
   "30days": "past 30 days",
   "6months": "past 6 months",
   "1year": "last year",
} as const satisfies TimeFrameMapToLabels

/*
   This fixes a mobile issue where the tooltip would not disappear after a view swipe.   
   Every time the view is swiped the index is changed and triggres a rerender of the charts components; and because ChartsTooltip key is based on Date.now(), it will always destroy the previous and unmount a new one because its key has changed.
*/
export const useResetChartsTooltip = (initialStep: number = 0) => {
   const [activeStep, setActiveStep] = useState(initialStep)

   const resetChartsTooltip = (step: number) => {
      setActiveStep(step)
   }

   return resetChartsTooltip
}
