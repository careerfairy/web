import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import useGroupATSJobsAllIntegrations from "components/custom-hook/useGroupATSJobsAllIntegrations"
import { useATSAccount } from "components/views/group/admin/ats-integration/ATSAccountContextProvider"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useMemo } from "react"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import MultiChipSelect from "../../general/components/MultiChipSelect"

type Props = {
   fieldId: string
}

const AtsJobSelector = ({ fieldId }: Props) => {
   const { group } = useGroup()
   const { atsAccount } = useATSAccount()
   const allJobs = useGroupATSJobsAllIntegrations([atsAccount])
   const {
      values: {
         jobs: { jobs },
      },
   } = useLivestreamFormValues()

   const options: LivestreamJobAssociation[] = useMemo(() => {
      return allJobs.map((job) => ({
         groupId: group.id,
         integrationId: job.integrationId,
         jobId: job.id,
         name: job.name,
         description: job.description,
      }))
   }, [allJobs, group.id])

   return (
      <MultiChipSelect
         id={fieldId}
         options={options}
         value={jobs}
         limit={5}
         multiple
         disableCloseOnSelect
         textFieldProps={{
            label: "Job related to this live stream",
            placeholder: "Select a job",
         }}
         isOptionEqualToValue={isOptionEqualToValue}
      />
   )
}

const isOptionEqualToValue = (
   option: LivestreamJobAssociation,
   value: LivestreamJobAssociation
): boolean => option.jobId === value.jobId

export default AtsJobSelector
