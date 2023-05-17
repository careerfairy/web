import Checkbox from "@mui/material/Checkbox"
import { FormControlLabel } from "@mui/material"
import React, { useCallback } from "react"
import { useRouter } from "next/router"

const JobCheck = () => {
   const { pathname, push, query } = useRouter()

   const isJobChecked = useCallback(
      () => query?.jobCheck === "true",
      [query.jobCheck]
   )

   const handleJobCheck = useCallback(
      (event) => {
         const checked = event.target.checked

         const newQuery = {
            ...query,
            ["jobCheck"]: checked,
            page: 0,
         }

         // if job check is false we don't want the filter to be applied
         // no jobCheck = false on the url
         if (!checked) {
            delete newQuery?.["jobCheck"]
         }

         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   return (
      <FormControlLabel
         key="job-check"
         control={
            <Checkbox
               // @ts-ignore
               size="large"
               sx={{ pl: 0 }}
               checked={isJobChecked()}
               onChange={handleJobCheck}
            />
         }
         label="Job opening available"
      />
   )
}

export default JobCheck
