import React, { Dispatch, useEffect, useMemo, useState } from "react"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import useGroupATSAccounts from "../../../custom-hook/useGroupATSAccounts"
import Section from "components/views/common/Section"
import ATSFormSection from "./ATSFormSection"
import { FormikValues } from "formik"
import CustomJobSection from "./customJobsSection/CustomJobSection"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import { groupRepo } from "../../../../data/RepositoryInstances"

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
   const { data: accounts } = useGroupATSAccounts(groupId)
   const [allOptions, setAllOptions] = useState<PublicCustomJob[]>([])

   useEffect(() => {
      ;(async () => {
         const groupJobs = await groupRepo.getAllCustomJobsFromGroup(groupId)

         if (groupJobs?.length) {
            setAllOptions(groupJobs)
         }
      })()
   }, [groupId, values.customJobs])

   // First sync should be complete to fetch the jobs
   const filteredAccounts = useMemo(() => {
      return accounts.filter((account) => account.firstSyncCompletedAt)
   }, [accounts])

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
               jobs={allOptions}
               values={values}
               setFieldValue={setFieldValue}
               isSubmitting={isSubmitting}
            />
         )}
      </Section>
   )
}

export default JobSelectorCategory
