import { Briefcase } from "react-feather"
import React from "react"
import { ResponsiveButton, useIsMobile } from "@careerfairy/shared-ui"

export const CheckJobsButton = () => {
   const isMobile = useIsMobile("md")

   return (
      <ResponsiveButton startIcon={<Briefcase />} variant="contained">
         {isMobile ? "Jobs" : "Check our jobs"}
      </ResponsiveButton>
   )
}
