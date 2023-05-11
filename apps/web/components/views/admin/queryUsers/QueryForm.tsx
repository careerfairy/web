import React, { useCallback, useMemo, useState } from "react"
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
import { usePreviousDistinct } from "react-use"

const QueryForm = () => {
   const [options, setOptions] = useState<BigQueryUserQueryOptions>({
      filters: {
         universityCountryCodes: [],
         universityCodes: [],
         universityName: "",
         fieldOfStudyIds: [],
         levelOfStudyIds: [],
         countriesOfInterest: [],
      },
      page: 0,
      orderBy: "firstName",
      sortOrder: "DESC",
      limit: 10,
   })
   const fetcher = useFunctionsSWR<BigQueryUserResponse[]>()
   const config = useMemo(
      () => ({
         ...reducedRemoteCallsOptions,
         suspense: false,
      }),
      []
   )
   const { data: users, isValidating } = useSWR(
      ["getBigQueryUsers_eu", options],
      fetcher,
      config
   )

   // Keep the previous users and display them when loading
   const prevUsers = usePreviousDistinct(users)

   const handleSort = useCallback(
      (orderBy: keyof BigQueryUserResponse, sortOrder: "DESC" | "ASC") => {
         setOptions((prev) => ({
            ...prev,
            orderBy,
            sortOrder,
            page: 0,
         }))
      },
      []
   )

   const handleChangeRowsPerPage = useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         setOptions((prevState) => ({
            ...prevState,
            limit: parseInt(event.target.value, 10),
            page: 0,
         }))
      },
      []
   )

   const handleChangePage = useCallback(
      (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
         setOptions((prevState) => ({ ...prevState, page: newPage }))
      },
      []
   )
   const title = `${
      (isValidating ? prevUsers : users)?.[0]?.totalHits || 0
   } - Subscribed Users Found`

   return (
      <>
         <AdminUsersTable
            loading={isValidating}
            pageSize={options.limit}
            handleSort={handleSort}
            setOptions={setOptions}
            title={title}
            queryOptions={options}
            users={isValidating ? prevUsers : users}
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
