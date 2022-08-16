import { Grid, Typography } from "@mui/material"
import React, { Dispatch, useMemo } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import FormGroup from "../FormGroup"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSJobsAllIntegrations from "../../../custom-hook/useGroupATSJobsAllIntegrations"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
}

const JobSelectorCategory = ({
   groupId,
   onSelectItems,
   selectedItems,
}: Props) => {
   const { data: accounts } = useGroupATSAccounts(groupId)
   const jobs = useGroupATSJobsAllIntegrations(accounts)

   const allValues: LivestreamJobAssociation[] = useMemo(() => {
      return jobs.map((job) => ({
         name: job.name,
         jobId: job.id,
         integrationId: job.integrationId,
      }))
   }, [jobs])

   // Only display the selector if the Group has ATS accounts linked
   if (accounts.length === 0) {
      return null
   }

   return (
      <>
         <Typography style={{ color: "white" }} variant="h4">
            Jobs:
         </Typography>

         <FormGroup>
            <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
               <MultiListSelect
                  inputName="jobIds"
                  selectedItems={selectedItems}
                  onSelectItems={onSelectItems}
                  allValues={allValues}
                  limit={1}
                  getKeyFn={(value) => value.jobId}
                  inputProps={{
                     label: "Select Job",
                     placeholder: "Select one job",
                  }}
                  chipProps={{
                     variant: "outlined",
                  }}
               />
            </Grid>
         </FormGroup>
      </>
   )
}

export default JobSelectorCategory
