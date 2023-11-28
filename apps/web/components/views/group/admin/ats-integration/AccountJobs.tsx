import React, { RefObject, useCallback, useRef } from "react"
import MaterialTable, {
   Column,
   MaterialTableProps,
   Options,
   Query,
   QueryResult,
} from "@material-table/core"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import Box from "@mui/material/Box"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import { Typography } from "@mui/material"
import { ATSDataPaginationOptions } from "@careerfairy/shared-lib/dist/ats/Functions"
import { atsServiceInstance } from "../../../../../data/firebase/ATSService"
import { sxStyles } from "../../../../../types/commonTypes"
import { useATSAccount } from "./ATSAccountContextProvider"

const perPage = 7

const tableOptions: Partial<Options<TRowData>> = {
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

const AccountJobs = () => {
   const { atsAccount } = useATSAccount()

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
   query: Query<TRowData>,
   pageHistory: RefObject<PageData[]>,
   groupId: string,
   id: string
): Promise<QueryResult<TRowData>> =>
   new Promise((resolve, reject) => {
      const { page, pageSize } = query
      let pageData: PageData = pageHistory.current.pop()
      const isBackwards = pageData.pageNumber > query.page

      let pagination: ATSDataPaginationOptions = {
         cursor: isBackwards ? pageData.prev : pageData.next,
         pageSize: query.pageSize,
      }

      atsServiceInstance
         .getJobs(groupId, id, pagination)
         .then((result) => {
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
         .catch(reject)
   })

const renderDescriptionColumn = (row: TRowData) => {
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

const columns: Column<TRowData>[] = [
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

const RowDetailPanel: MaterialTableProps<TRowData>["detailPanel"] = (row) => {
   const job = row.rowData
   return (
      <Box p={2}>
         <strong>Description:</strong>
         <SanitizedHTML htmlString={job.description} />
      </Box>
   )
}

const expandDetailPanel: MaterialTableProps<TRowData>["onRowClick"] = (
   event,
   rowData,
   togglePanel
) => togglePanel()

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

type TRowData = ReturnType<typeof mapJobsToTableRows>[number]

type TableTitleProps = {
   title: string
   subtitle?: string
}

export const TableTitle = ({ title, subtitle }: TableTitleProps) => {
   return (
      <>
         <Box display="flex">
            <Typography variant="h6">{title}</Typography>
         </Box>
         {subtitle && (
            <Box>
               <Typography variant="subtitle1" fontSize="0.8rem" color="gray">
                  {subtitle}
               </Typography>
            </Box>
         )}
      </>
   )
}

export default AccountJobs
