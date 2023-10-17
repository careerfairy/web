import React, { Dispatch, useMemo } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import Section from "components/views/common/Section"
import ATSFormSection from "./ATSFormSection"
import { FormikValues } from "formik"
import CustomJobSection from "./customJobsSection/CustomJobSection"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import { CircularProgress } from "@mui/material"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   sectionRef: any
   classes: any
   values: FormikValues
   setFieldValue: (field: string, value: any) => void
   isSubmitting: boolean
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
   values,
   setFieldValue,
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
               values={values}
               setFieldValue={setFieldValue}
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
   values: FormikValues
   setFieldValue: (field: string, value: any) => void
   isSubmitting: boolean
}
const JobSection = ({
   groupId,
   selectedItems,
   onSelectItems,
   values,
   setFieldValue,
   isSubmitting,
}: JobSectionProps) => {
   const { data: accounts } = useGroupATSAccounts(groupId)

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
      <SuspenseWithBoundary>
         <CustomJobSection
            groupId={groupId}
            values={values}
            setFieldValue={setFieldValue}
            isSubmitting={isSubmitting}
         />
      </SuspenseWithBoundary>
   )
}

export default JobSelectorCategory
