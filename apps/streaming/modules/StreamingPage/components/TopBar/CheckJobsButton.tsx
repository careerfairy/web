import { Briefcase } from "react-feather"
import React from "react"
import { ResponsiveButton } from "@careerfairy/shared-ui"

export const CheckJobsButton = () => {
   return (
      <ResponsiveButton startIcon={<Briefcase />} variant="contained">
         Check our jobs
      </ResponsiveButton>
   )
}
