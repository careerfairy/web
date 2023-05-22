import { Alert, Box, Grid, Typography } from "@mui/material"
import React, { Dispatch, useEffect, useMemo } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import FormGroup from "../FormGroup"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSJobsAllIntegrations from "../../../custom-hook/useGroupATSJobsAllIntegrations"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import { useStreamCreationProvider } from "../StreamForm/StreamCreationProvider"
import Section from "components/views/common/Section"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   sectionRef: any
   classes: any
}

/**
 * Display the job selector if the Group has any ATS account linked with
 * the first sync complete
 *
 * It will fetch all jobs from all accounts
 *
 * @param groupId
 * @param onSelectItems
 * @param selectedItems
 * @param sectionRef
 * @param classes
 * @constructor
 */
const JobSelectorCategory = ({
   groupId,
   onSelectItems,
   selectedItems,
   sectionRef,
   classes,
}: Props) => {
   const { data: accounts } = useGroupATSAccounts(groupId)

   // First sync should be complete to fetch the jobs
   const filteredAccounts = useMemo(() => {
      return accounts.filter((account) => account.firstSyncCompletedAt)
   }, [accounts])

   // Only display the selector if the Group has ATS accounts linked with first sync complete
   if (filteredAccounts.length === 0) {
      return null
   }

   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"JobSection"}
         className={classes.section}
      >
         <FormSection
            groupId={groupId}
            accounts={filteredAccounts}
            selectedItems={selectedItems}
            onSelectItems={onSelectItems}
         />
      </Section>
   )
}

type FormSectionProps = {
   groupId: string
   accounts: GroupATSAccount[]
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
}

const FormSection = ({
   groupId,
   accounts,
   selectedItems,
   onSelectItems,
}: FormSectionProps) => {
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
   groupId: FormSectionProps["groupId"]
   accounts: FormSectionProps["accounts"]
   onSelectItems: FormSectionProps["onSelectItems"]
   selectedItems: FormSectionProps["selectedItems"]
}

const JobSelector = ({
   groupId,
   accounts,
   selectedItems,
   onSelectItems,
}: JobSelectorProps) => {
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

export default JobSelectorCategory
