import useGroupATSJobs from "../../../../custom-hook/useGroupATSJobs"
import { useMemo } from "react"
import MaterialTable from "@material-table/core"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"

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

type Props = {
   atsAccount: GroupATSAccount
}

const AccountJobs = ({ atsAccount }: Props) => {
   const { jobs } = useGroupATSJobs(atsAccount.groupId, atsAccount.id)
   console.log("-> jobs", jobs)

   const jobsToRows = useMemo(() => {
      return mapJobsToTableRows(jobs)
   }, [jobs])

   return <MaterialTable columns={columns} data={jobsToRows} title={"Jobs"} />
}

function mapJobsToTableRows(jobs: Job[]) {
   return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      description: job.description,
      status: job.status,
      hiringManager: job.hiringManagers[0]?.getName(),
      createdAt: job.createdAt.toLocaleDateString(),
   }))
}

export default AccountJobs
