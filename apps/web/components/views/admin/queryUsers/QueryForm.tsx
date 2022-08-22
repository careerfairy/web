import React, { useState } from "react"
import { TablePagination } from "@mui/material"
import AdminUsersTable from "./AdminUsersTable"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../custom-hook/utils/useFunctionsSWRFetcher"
import {
   BigQueryUserQueryOptions,
   BigQueryUserResponse,
} from "@careerfairy/shared-lib/dist/bigQuery/types"

const QueryForm = () => {
   const [options, setOptions] = useState<BigQueryUserQueryOptions>({
      universityCountryCodes: [],
      universityName: "",
      fieldOfStudyIds: [],
      levelOfStudyIds: [],
      page: 0,
      orderBy: "firstName",
      sortOrder: "DESC",
      limit: 10,
   })
   const fetcher = useFunctionsSWR<BigQueryUserResponse[]>()

   const { data: users, isValidating } = useSWR(
      ["getBigQueryUsers", options],
      fetcher,
      reducedRemoteCallsOptions
   )

   const handleSort = (
      orderBy: keyof BigQueryUserResponse,
      sortOrder: "DESC" | "ASC"
   ) => {
      setOptions((prev) => ({
         ...prev,
         orderBy,
         sortOrder,
         page: 0,
      }))
   }

   const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      setOptions((prevState) => ({
         ...prevState,
         limit: parseInt(event.target.value, 10),
         page: 0,
      }))
   }

   const handleChangePage = (
      event: React.MouseEvent<HTMLButtonElement> | null,
      newPage: number
   ) => {
      setOptions((prevState) => ({ ...prevState, page: newPage }))
   }

   return (
      <>
         <AdminUsersTable
            loading={isValidating}
            pageSize={options.limit}
            handleSort={handleSort}
            setOptions={setOptions}
            title={`${users?.[0]?.totalHits || 0} - Subscribed Users Found`}
            queryOptions={options}
            users={users}
         />
         <TablePagination
            component="div"
            count={users?.[0]?.totalHits || 0}
            page={options.page}
            onPageChange={handleChangePage}
            rowsPerPage={options.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
         />
      </>
   )
}

export default QueryForm
