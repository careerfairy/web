import { Grid, Typography } from "@mui/material"
import React, { Dispatch, useMemo } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import FormGroup from "../FormGroup"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSJobsAllIntegrations from "../../../custom-hook/useGroupATSJobsAllIntegrations"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
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
 * @constructor
 */
const JobSelectorCategory = ({
   groupId,
   onSelectItems,
   selectedItems,
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
      <FormSection
         groupId={groupId}
         accounts={filteredAccounts}
         selectedItems={selectedItems}
         onSelectItems={onSelectItems}
      />
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
      <>
         <Typography fontWeight="bold" variant="h4">
            Job
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Select a job that related to this event
         </Typography>

         <FormGroup container boxShadow={0}>
            <Grid xs={12} item>
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
                     variant: "contained",
                     color: "secondary",
                  }}
               />
            </Grid>
         </FormGroup>
      </>
   )
}
export default JobSelectorCategory
