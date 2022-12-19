import React, { RefObject, useCallback, useRef } from "react"
import MaterialTable, {
   Options,
   Query,
   QueryResult,
} from "@material-table/core"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import Box from "@mui/material/Box"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import { Typography } from "@mui/material"
import { ATSDataPaginationOptions } from "@careerfairy/shared-lib/dist/ats/Functions"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import { sxStyles } from "../../../../../types/commonTypes"

type Props = {
   atsAccount: GroupATSAccount
}

const perPage = 7

const tableOptions: Partial<Options<object>> = {
   paginationType: "stepped",
   showFirstLastPageButtons: false,
   pageSizeOptions: [perPage], // don't allow the user to change the page size
   pageSize: perPage,
   search: false,
}

type PageData = {
   pageNumber: number
   next: string
   prev: string
}

const styles = sxStyles({
   table: {
      "& .MuiTablePagination-displayedRows": {
         display: "none",
      },
   },
})

const AccountJobs = ({ atsAccount }: Props) => {
   // keep track of previous page
   let pageHistory = useRef<PageData[]>([
      {
         pageNumber: 0,
         next: null,
         prev: null,
      },
   ])

   const fetcher = useCallback(
      (query) => {
         return fetchPage(query, pageHistory, atsAccount.groupId, atsAccount.id)
      },
      [atsAccount.groupId, atsAccount.id]
   )

   return (
      <Box sx={styles.table}>
         <MaterialTable
            columns={columns}
            data={fetcher}
            title={<TableTitle title="Jobs" subtitle="Most recent open Jobs" />}
            detailPanel={RowDetailPanel}
            onRowClick={expandDetailPanel}
            options={tableOptions}
         />
      </Box>
   )
}

const fetchPage = (
   query: Query<object>,
   pageHistory: RefObject<PageData[]>,
   groupId: string,
   id: string
): Promise<QueryResult<object>> =>
   new Promise((resolve, reject) => {
      const { page, pageSize } = query
      let pageData: PageData = pageHistory.current.pop()
      const isBackwards = pageData.pageNumber > query.page

      let pagination: ATSDataPaginationOptions = {
         cursor: isBackwards ? pageData.prev : pageData.next,
         pageSize: query.pageSize,
      }

      atsServiceInstance.getJobs(groupId, id, pagination).then((result) => {
         let total = query.page * pageSize + result.results.length

         if (result.next) {
            // hack for us to have the next page link, if there is a next cursor
            // we know that at least there is one more item in the next page
            total += 1
         }

         pageHistory.current.push({
            pageNumber: page,
            next: result.next,
            prev: result.previous,
         })

         resolve({
            data: mapJobsToTableRows(result.results),
            page: page,
            totalCount: total,
         })
      })
   })

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
      title: "Updated At",
      field: "updatedAt",
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
   return jobs?.map((job) => ({
      id: job.id,
      name: job.name,
      description: job.description,
      descriptionStripped: job.descriptionStripped,
      status: job.status,
      hiringManager: job.hiringManagers[0]?.getName(),
      updatedAt: job.updatedAt?.toLocaleString(),
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
