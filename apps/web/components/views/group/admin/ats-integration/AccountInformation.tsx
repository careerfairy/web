import useGroupATSJobs from "../../../../custom-hook/useGroupATSJobs"
import MaterialTable from "@material-table/core"
import Box from "@mui/material/Box"
import { useMemo } from "react"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import SyncStatusButtonDialog from "./SyncStatusButtonDialog"

type Props = {
   atsAccount: GroupATSAccount
}

const columns = [
   {
      title: "Name",
      field: "name",
   },
   {
      title: "Description",
      field: "description",
   },
   {
      title: "Status",
      field: "status",
   },
   {
      title: "Hiring Manager",
      field: "hiringManager",
   },
   {
      title: "Created At",
      field: "createdAt",
   },
]

const AccountInformation = ({ atsAccount }: Props) => {
   const { jobs } = useGroupATSJobs(atsAccount.groupId, atsAccount.id)

   const jobsToRows = useMemo(() => {
      return mapJobsToTableRows(jobs)
   }, [jobs])

   return (
      <>
         <Box
            display={"flex"}
            justifyContent={"end"}
            alignItems={"end"}
            mt={1}
            pr={3}
         >
            <SyncStatusButtonDialog
               groupId={atsAccount.groupId}
               integrationId={atsAccount.id}
            />
         </Box>
         <Box p={2}>
            <Table data={jobsToRows} columns={columns} title={"Jobs"} />
         </Box>
      </>
   )
}

type TableProps<T> = {
   data: T[]
   title?: string
   columns?: object[]
}

const Table = <T extends object>(props: TableProps<T>) => {
   return (
      <MaterialTable
         columns={props.columns}
         data={props.data}
         title={props.title}
      />
   )
}

function mapJobsToTableRows(jobs: Job[]) {
   return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      description: job.description,
      status: job.status,
      hiringManager: job.hiringManagers[0].getName(),
      createdAt: job.createdAt.toLocaleDateString(),
   }))
}

export default AccountInformation
