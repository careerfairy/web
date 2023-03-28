import React, { FC, useCallback, useMemo, useState } from "react"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import MaterialTable, {
   Column,
   Localization,
   Options,
} from "@material-table/core"
import { OrderByDirection } from "@firebase/firestore"
import {
   Box,
   Divider,
   IconButton,
   Skeleton,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { universityCountriesMap } from "../../../../../util/constants/universityCountries"
import usePaginatedLivestreamUsers from "../../analytics-new/live-stream/users/usePaginatedLivestreamUsers"
import Stack from "@mui/material/Stack"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import { LINKEDIN_COLOR } from "../../../../../util/colors"
import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { LoadingButton } from "@mui/lab"
import { useDownloadCV } from "./hooks"
import { sanitizeUserLivestreamData } from "./util"
import { CountriesSelect } from "./CountriesSelect"
import UniversitySelect from "./UniversitySelect"
import FieldOfStudySelect from "./FieldOfStudySelect"
import LevelOfStudySelect from "./LevelOfStudySelect"
import ResetFiltersIcon from "@mui/icons-material/RotateLeft"
import { useUserLivestreamDataTableContext } from "./UserLivestreamDataTableProvider"

export type SortModel = {
   field: string
   sort: OrderByDirection
}

const styles = sxStyles({
   root: {
      "& button": {},
      minHeight: 300,
      width: "100%",
      "& .MuiPaper-root": {
         boxShadow: "none",
      },
      boxShadow: (theme) => theme.boxShadows.dark_8_25_10,
      borderRadius: "10px",
      backgroundColor: "background.paper",
      "& thead": {
         "& th": {
            px: 4,
            py: 2,
         },
      },
      "& tbody": {
         "& td": {
            px: 4,
            py: 1.5,
         },
      },
   },
   title: {
      border: "2px solid red",
   },
   linkedInIcon: {
      color: LINKEDIN_COLOR,
   },
   tableButton: {
      padding: 0.3,
   },
   toolbar: {
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      display: "flex",
      alignItems: "center",
   },
   skeletonFilter: {
      borderRadius: 2,
      flex: 0.3,
   },
})

const baseOptions: Options<UserLivestreamData> = {
   pageSizeOptions: [5, 10, 25, 50, 100],
   padding: "dense",
   search: false,
   actionsColumnIndex: -1,
   emptyRowsWhenPaging: false, // to make page size fix in case of less data rows
   paginationType: "stepped",
   toolbar: false,
   showFirstLastPageButtons: false,
}

const localization: Localization = {
   body: {
      emptyDataSourceMessage: "No users found",
   },
}

const UserLivestreamDataTable = () => {
   const { filters, livestreamId } = useUserLivestreamDataTableContext()

   const [rowsPerPage, setRowsPerPage] = useState(10)
   const [sortModel, setSortModel] = useState<SortModel>(null)

   const results = usePaginatedLivestreamUsers(
      livestreamId,
      rowsPerPage,
      sortModel,
      filters
   )

   const handlePageChange = useCallback(
      (newPage: number) => {
         if (newPage > results.page - 1) {
            void results.next()
         } else {
            results.prev()
         }
      },
      [results]
   )

   const handlePageSizeChange = useCallback((pageSize: number) => {
      setRowsPerPage(pageSize)
   }, [])

   const handleSortModelChange = useCallback(
      (columnIndex: number, orderDirection: "asc" | "desc"): void => {
         if (columnIndex === -1) {
            setSortModel(null)
            return
         }
         const targetColumn = columns[columnIndex]
         setSortModel({
            field: targetColumn.field as string,
            sort: orderDirection,
         })
      },
      []
   )

   const data = useMemo(
      () => sanitizeUserLivestreamData(results.data),
      [results.data]
   )
   const options = useMemo<Options<UserLivestreamData>>(
      () => ({
         ...baseOptions,
         pageSize: rowsPerPage,
      }),
      [rowsPerPage]
   )

   return (
      <Box sx={styles.root}>
         <Toolbar />
         <MaterialTable
            data={data}
            isLoading={results.loading}
            columns={columns}
            localization={localization}
            options={options}
            onRowsPerPageChange={handlePageSizeChange}
            totalCount={results.countQueryResponse.count ?? undefined}
            page={results.page - 1}
            onPageChange={handlePageChange}
            onOrderChange={handleSortModelChange}
         />
      </Box>
   )
}

export const TableSkeleton = () => {
   return (
      <Box sx={styles.root}>
         <Stack width="100%" direction="row" spacing={2} p={2}>
            {Array.from({ length: 4 }).map((_, index) => (
               <Skeleton
                  variant="rectangular"
                  sx={styles.skeletonFilter}
                  height={50}
                  key={index}
               />
            ))}
         </Stack>
         <MaterialTable
            data={[]}
            options={{ ...baseOptions, showEmptyDataSourceMessage: false }}
            isLoading
            localization={localization}
            columns={columns}
         />
      </Box>
   )
}

type ToolbarProps = {}
const Toolbar: FC<ToolbarProps> = () => {
   const { filters, resetFilters } = useUserLivestreamDataTableContext()

   const filterActive = useMemo<boolean>(() => {
      return Boolean(
         filters.selectedFieldOfStudy ||
            filters.selectedLevelOfStudy ||
            filters.selectedUniversity ||
            filters.selectedCountryCodes.length > 0
      )
   }, [filters])

   return (
      <Box sx={styles.toolbar}>
         <Stack
            divider={<Divider orientation="vertical" flexItem />}
            overflow="auto"
            alignItems="center"
            direction="row"
            p={2}
         >
            <CountriesSelect />
            <UniversitySelect />
            <FieldOfStudySelect />
            <LevelOfStudySelect />
         </Stack>
         <Box sx={{ flexGrow: 1 }} />
         <Tooltip title="Reset Filters">
            <Box p={2}>
               <IconButton
                  onClick={resetFilters}
                  disabled={!filterActive}
                  color="primary"
                  size="small"
               >
                  <ResetFiltersIcon />
               </IconButton>
            </Box>
         </Tooltip>
      </Box>
   )
}

const RenderFullNameAndEmailColumn = (rowData: UserLivestreamData) => {
   return (
      <Box>
         <Typography gutterBottom fontWeight={600} variant="body1">
            {rowData.user.firstName} {rowData.user.lastName}
         </Typography>
         <Typography variant="body2" color="textSecondary">
            {rowData.user.userEmail}
         </Typography>
      </Box>
   )
}

const CVColumn = (rowData: UserLivestreamData) => {
   const { handleDownloadCV, downloading } = useDownloadCV(rowData.user)

   return rowData.user.userResume ? (
      <Tooltip title={`Download CV for ${rowData.user.firstName}`}>
         <LoadingButton
            loading={downloading}
            onClick={handleDownloadCV}
            sx={styles.tableButton}
            size="small"
            color="secondary"
            variant="outlined"
            startIcon={<DownloadIcon />}
         >
            CV
         </LoadingButton>
      </Tooltip>
   ) : null
}

const iconWidth = 40
const RowActions = (rowData: UserLivestreamData) => {
   return (
      <Stack alignItems="center" direction="row">
         <Box width={iconWidth}>
            {rowData.user.linkedinUrl ? (
               <IconButton
                  component="a"
                  href={rowData.user.linkedinUrl}
                  target="_blank"
                  sx={styles.linkedInIcon}
               >
                  <LinkedInIcon />
               </IconButton>
            ) : null}
         </Box>
      </Stack>
   )
}

const columns: Column<UserLivestreamData>[] = [
   {
      field: "user.firstName",
      title: "Full Name & Email",
      cellStyle: {
         minWidth: 180,
      },
      render: RenderFullNameAndEmailColumn,
   },
   {
      field: "user.universityCountryCode",
      title: "Country",
      lookup: universityCountriesMap,
   },
   {
      field: "user.university.name",
      title: "University Name",
      cellStyle: {
         minWidth: 200,
      },
   },
   {
      title: "Field Of Study",
      field: "user.fieldOfStudy.name",
      cellStyle: {
         minWidth: 200,
      },
   },
   {
      title: "Level Of Study",
      field: "user.levelOfStudy.name",
      cellStyle: {
         minWidth: 100,
      },
   },
   {
      field: "user.userResume",
      title: "CV",
      type: "boolean",
      searchable: false,
      render: CVColumn,
      cellStyle: {
         width: 300,
      },
   },
   {
      render: RowActions,
   },
   {
      field: "user.userEmail",
      title: "User Email",
      cellStyle: {
         minWidth: 150,
      },
      hidden: true,
   },
   {
      field: "user.firstName",
      title: "First Name",
      hidden: true,
      cellStyle: {
         minWidth: 150,
      },
   },
   {
      hidden: true,
      field: "user.lastName",
      title: "Last Name",

      cellStyle: {
         minWidth: 150,
      },
   },
]

export default UserLivestreamDataTable
