import { useStreamCreationProvider } from "../StreamForm/StreamCreationProvider"
import React, { Dispatch, FC, useEffect, useMemo } from "react"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
import { Alert, Box, Grid, Typography } from "@mui/material"
import useGroupATSJobsAllIntegrations from "../../../custom-hook/useGroupATSJobsAllIntegrations"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import FormGroup from "../FormGroup"
import MultiListSelect from "../../common/MultiListSelect"

type ATSFormSectionProps = {
   groupId: string
   accounts: GroupATSAccount[]
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
}
const ATSFormSection: FC<ATSFormSectionProps> = ({
   groupId,
   accounts,
   selectedItems,
   onSelectItems,
}) => {
   const { setShowJobSection, showJobSection } = useStreamCreationProvider()

   useEffect(() => {
      if (!showJobSection) {
         setShowJobSection(true)
      }
   }, [setShowJobSection, showJobSection])

   /**
    * An account is fully ready if it has first sync completed and
    * application test completed, if the application test is missing we display an error message instead
    */
   const accountsNotReady: GroupATSAccount[] = useMemo(() => {
      return accounts.filter((a) => !a.applicationTestCompletedAt)
   }, [accounts])

   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Job
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Select a job that related to this event
         </Typography>

         {accountsNotReady.length > 0 && (
            <Box my={2}>
               <Alert color="error">
                  You need to complete the Application Test for{" "}
                  {accountsNotReady.map((a) => a.name).join(", ")} before you
                  can associate Jobs to your Live Stream.
               </Alert>
            </Box>
         )}

         {accountsNotReady.length === 0 && (
            <JobSelector
               groupId={groupId}
               accounts={accounts}
               selectedItems={selectedItems}
               onSelectItems={onSelectItems}
            />
         )}
      </>
   )
}

type JobSelectorProps = {
   groupId: ATSFormSectionProps["groupId"]
   accounts: ATSFormSectionProps["accounts"]
   onSelectItems: ATSFormSectionProps["onSelectItems"]
   selectedItems: ATSFormSectionProps["selectedItems"]
}

const JobSelector: FC<JobSelectorProps> = ({
   groupId,
   accounts,
   selectedItems,
   onSelectItems,
}) => {
   const jobs = useGroupATSJobsAllIntegrations(accounts)
   const allValues: LivestreamJobAssociation[] = useMemo(() => {
      return jobs.map((job) => ({
         groupId: groupId,
         integrationId: job.integrationId,
         jobId: job.id,
         name: job.name,
      }))
   }, [jobs, groupId])

   return (
      <FormGroup container boxShadow={0}>
         <Grid xs={12} item>
            <MultiListSelect
               inputName="jobIds"
               selectedItems={selectedItems}
               onSelectItems={onSelectItems}
               allValues={allValues}
               isCheckbox
               // limit={1} // TODO: Bring back limit after ASUS event 23/05/2023
               getValueFn={(value) => value.jobId}
               getKeyFn={(value) => value.jobId}
               inputProps={{
                  label: "Select Job",
                  placeholder: "Select one job",
               }}
               chipProps={{
                  variant: "contained",
                  color: "secondary",
               }}
            />
         </Grid>
      </FormGroup>
   )
}

export default ATSFormSection
