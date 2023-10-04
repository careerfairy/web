import {
   BigQueryUserQueryOptions,
   BigQueryUserResponse,
} from "@careerfairy/shared-lib/dist/bigQuery/types"
import { TablePagination } from "@mui/material"
import React, { useCallback, useState } from "react"
import { usePreviousDistinct } from "react-use"
import AdminUsersTable from "./AdminUsersTable"
import useUserRecords from "./useUserRecords"

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

   const { users, isValidating } = useUserRecords(options)

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
   } - subscribed users active in the last 18 months`

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
