import React, { useMemo } from "react"
import MaterialTable from "@material-table/core"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import useGroupATSApplications from "../../../../custom-hook/useGroupATSApplications"
import { Application } from "@careerfairy/shared-lib/dist/ats/Application"
import { TableTitle } from "./AccountJobs"

const columns = [
   {
      title: "Job",
      field: "jobName",
   },
   {
      title: "Candidate",
      field: "candidateName",
   },
   {
      title: "Source",
      field: "source",
   },
   {
      title: "Applied At",
      field: "appliedAt",
   },
   {
      title: "Current Stage",
      field: "currentStage",
   },
]

type Props = {
   atsAccount: GroupATSAccount
}

const AccountApplications = ({ atsAccount }: Props) => {
   const { applications } = useGroupATSApplications(
      atsAccount.groupId,
      atsAccount.id
   )

   const applicationsToRows = useMemo(() => {
      return mapApplicationsToTableRows(applications)
   }, [applications])

   return (
      <MaterialTable
         columns={columns}
         data={applicationsToRows}
         title={
            <TableTitle
               title="Applications"
               subtitle="Most recent applications across all sources"
            />
         }
      />
   )
}

function mapApplicationsToTableRows(data: Application[]) {
   return data.map((application) => ({
      id: application.id,
      jobName: application.job?.name,
      candidateName: application.candidate?.getName(),
      source: application.source,
      appliedAt: application.appliedAt?.toLocaleString(),
      currentStage: application.currentStage,
   }))
}

export default AccountApplications
