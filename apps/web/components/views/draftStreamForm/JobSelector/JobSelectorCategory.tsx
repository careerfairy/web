import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import Section from "components/views/common/Section"
import ATSFormSection from "./ATSFormSection"
import CustomJobSection from "./customJobsSection/CustomJobSection"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import { CircularProgress } from "@mui/material"
import useGroupCustomJobs from "../../../custom-hook/custom-job/useGroupCustomJobs"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   sectionRef: any
   classes: any
   isSubmitting: boolean
   streamId: string
   selectedCustomJobs: CustomJob[]
   onSelectedCustomJobs: Dispatch<SetStateAction<CustomJob[]>>
}

/**
 * Display the job selector if the Group has any ATS account linked with
 * the first sync complete
 *
 * It will fetch all jobs from all accounts
 *
 */
const JobSelectorCategory = ({
   groupId,
   onSelectItems,
   selectedItems,
   sectionRef,
   classes,
   streamId,
   selectedCustomJobs,
   onSelectedCustomJobs,
   isSubmitting,
}: Props) => {
   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"JobSection"}
         className={classes.section}
      >
         <SuspenseWithBoundary fallback={<CircularProgress />}>
            <JobSection
               groupId={groupId}
               selectedItems={selectedItems}
               onSelectItems={onSelectItems}
               streamId={streamId}
               selectedCustomJobs={selectedCustomJobs}
               onSelectedCustomJobs={onSelectedCustomJobs}
               isSubmitting={isSubmitting}
            />
         </SuspenseWithBoundary>
      </Section>
   )
}

type JobSectionProps = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   streamId: string
   selectedCustomJobs: CustomJob[]
   onSelectedCustomJobs: Dispatch<SetStateAction<CustomJob[]>>
   isSubmitting: boolean
}
const JobSection = ({
   groupId,
   selectedItems,
   onSelectItems,
   streamId,
   selectedCustomJobs,
   onSelectedCustomJobs,
   isSubmitting,
}: JobSectionProps) => {
   const { data: accounts } = useGroupATSAccounts(groupId)
   const allCustomJobs = useGroupCustomJobs(groupId)
   const initialSelectedJobs = useGroupCustomJobs(groupId, {
      livestreamId: streamId,
   })

   useEffect(() => {
      if (initialSelectedJobs && streamId) {
         onSelectedCustomJobs(initialSelectedJobs)
      }
   }, [])

   // First sync should be complete to fetch the jobs
   const filteredAccounts = useMemo(() => {
      return accounts.filter((account) => account.firstSyncCompletedAt)
   }, [accounts])

   return filteredAccounts.length ? (
      <ATSFormSection
         groupId={groupId}
         accounts={filteredAccounts}
         selectedItems={selectedItems}
         onSelectItems={onSelectItems}
      />
   ) : (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <CustomJobSection
            groupId={groupId}
            streamId={streamId}
            allJobs={allCustomJobs}
            selectedCustomJobs={selectedCustomJobs}
            onSelectedCustomJobs={onSelectedCustomJobs}
            isSubmitting={isSubmitting}
         />
      </SuspenseWithBoundary>
   )
}

export default JobSelectorCategory
