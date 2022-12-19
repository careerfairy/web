import useGroupATSJobs from "../../../../custom-hook/useGroupATSJobs"
import React, { useMemo, useState } from "react"
import MaterialTable, { Options } from "@material-table/core"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import Box from "@mui/material/Box"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import { Typography } from "@mui/material"
import { ATSDataPaginationOptions } from "@careerfairy/shared-lib/dist/ats/Functions"

type Props = {
   atsAccount: GroupATSAccount
}

const tableOptions: Partial<Options<object>> = {
   paginationType: "stepped",
   showFirstLastPageButtons: false,
}

type Page = {
   cursor: string
   page: number
}

const AccountJobs = ({ atsAccount }: Props) => {
   const [page, setPage] = useState<Page>({
      cursor: null,
      page: 1,
   })

   let atsPagination: ATSDataPaginationOptions = useMemo(
      () => ({ cursor: page.cursor, pageSize: 1 }),
      [page.cursor]
   )

   const data = useGroupATSJobs(
      atsAccount.groupId,
      atsAccount.id,
      atsPagination
   )

   const jobsToRows = useMemo(() => {
      return mapJobsToTableRows(data?.results)
   }, [data?.results])

   return (
      <MaterialTable
         onPageChange={(pageNumber, pageSize) => {
            console.log("here onChangePage", pageNumber, pageSize)
         }}
         columns={columns}
         data={jobsToRows}
         title={<TableTitle title="Jobs" subtitle="Most recent open Jobs" />}
         detailPanel={RowDetailPanel}
         onRowClick={expandDetailPanel}
         options={tableOptions}
      />
   )
}

const renderDescriptionColumn = (row) => {
   return (
      <Box
         sx={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: 350,
         }}
         title={row.descriptionStripped}
      >
         {row.descriptionStripped}
      </Box>
   )
}

const columns = [
   {
      title: "Name",
      field: "name",
   },
   {
      title: "Description",
      field: "descriptionStripped",
      render: renderDescriptionColumn,
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

const RowDetailPanel = (row) => {
   const job: Job = row.rowData
   return (
      <Box p={2}>
         <strong>Description:</strong>
         <SanitizedHTML htmlString={job.description} />
      </Box>
   )
}

const expandDetailPanel = (event, rowData, togglePanel) => togglePanel()

function mapJobsToTableRows(jobs: Job[]) {
   return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      description: job.description,
      descriptionStripped: job.descriptionStripped,
      status: job.status,
      hiringManager: job.hiringManagers[0]?.getName(),
      createdAt: job.createdAt?.toLocaleString(),
   }))
}

type TableTitleProps = {
   title: string
   subtitle?: string
}

export const TableTitle = ({ title, subtitle }: TableTitleProps) => {
   return (
      <Box display="flex" alignItems="center">
         <Typography variant="h6">{title}</Typography>
         {subtitle && (
            <Typography
               variant="subtitle1"
               fontSize="0.8rem"
               color="gray"
               ml={1}
            >
               {subtitle}
            </Typography>
         )}
      </Box>
   )
}

export default AccountJobs
