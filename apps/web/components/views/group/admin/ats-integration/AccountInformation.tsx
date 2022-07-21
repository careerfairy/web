import useGroupATSJobs from "../../../../custom-hook/useGroupATSJobs"
import MaterialTable from "@material-table/core"
import Box from "@mui/material/Box"
import { capitalizeFirstLetter } from "../../../../../util/CommonUtil"
import { useMemo } from "react"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import { Button } from "@mui/material"
import SyncStatusButtonDialog from "./SyncStatusButtonDialog"

type Props = {
   atsAccount: GroupATSAccount
}

const AccountInformation = ({ atsAccount }: Props) => {
   const { jobs } = useGroupATSJobs(atsAccount.groupId, atsAccount.id)

   const jobsToRows = useMemo(() => {
      return mapJobsToTableRows(jobs)
   }, [jobs])

   const columns = useMemo(() => {
      return [
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
   }, [])

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
   const columns = props.columns ?? generateColumnsFromObject(props.data[0])

   return (
      <MaterialTable columns={columns} data={props.data} title={props.title} />
   )
}

function generateColumnsFromObject<T>(obj: T) {
   const columns = []

   for (let objKey in obj) {
      columns.push({
         title: capitalizeFirstLetter(objKey),
         field: objKey,
      })
   }

   return columns
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
