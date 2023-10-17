import React, { Dispatch, useMemo } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import Section from "components/views/common/Section"
import ATSFormSection from "./ATSFormSection"
import { FormikValues } from "formik"
import CustomJobSection from "./customJobsSection/CustomJobSection"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"

type Props = {
   groupId: string
   onSelectItems: Dispatch<any>
   selectedItems: LivestreamJobAssociation[]
   sectionRef: any
   classes: any
   values: FormikValues
   setFieldValue: (field: string, value: any) => void
   isSubmitting: boolean
   atsAccounts: GroupATSAccount[]
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
   atsAccounts,
}: Props) => {
   // First sync should be complete to fetch the jobs
   const filteredAccounts = useMemo(() => {
      return atsAccounts.filter((account) => account.firstSyncCompletedAt)
   }, [atsAccounts])

   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"JobSection"}
         className={classes.section}
      >
         {filteredAccounts.length ? (
            <ATSFormSection
               groupId={groupId}
               accounts={filteredAccounts}
               selectedItems={selectedItems}
               onSelectItems={onSelectItems}
            />
         ) : (
            <CustomJobSection
               groupId={groupId}
               values={values}
               setFieldValue={setFieldValue}
               isSubmitting={isSubmitting}
            />
         )}
      </Section>
   )
}

export default JobSelectorCategory
