import React, { FC, ReactNode, useCallback, useMemo, useState } from "react"
import MaterialTable, {
   Column,
   Localization,
   MTablePagination,
   Options,
} from "@material-table/core"
import { OrderByDirection } from "@firebase/firestore"
import {
   Box,
   Button,
   Divider,
   IconButton,
   Skeleton,
   TablePagination,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { universityCountriesMap } from "../../../../../util/constants/universityCountries"
import usePaginatedUsersCollection from "../../analytics-new/live-stream/users/usePaginatedUsersCollection"
import Stack from "@mui/material/Stack"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import { LINKEDIN_COLOR } from "../../../../../util/colors"
import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { LoadingButton } from "@mui/lab"
import { useDownloadCV } from "./hooks"
import { CountriesSelect } from "./CountriesSelect"
import UniversitySelect from "./UniversitySelect"
import FieldOfStudySelect from "./FieldOfStudySelect"
import LevelOfStudySelect from "./LevelOfStudySelect"
import ResetFiltersIcon from "@mui/icons-material/RotateLeft"
import CopyIcon from "@mui/icons-material/ContentCopy"
import { useUserDataTable } from "./UserDataTableProvider"
import ExportIcon from "@mui/icons-material/ListAltOutlined"
import useIsMobile from "../../../../../custom-hook/useIsMobile"

export type SortedTableColumn = {
   field: string
   direction: OrderByDirection
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
   actionsWrapper: {
      "& button": {
         padding: [0.5, 1],
         borderRadius: 2,
      },
   },
})

export type UserDataEntry = {
   firstName: string
   lastName: string
   email: string
   universityCountryCode: string
   universityName: string
   fieldOfStudy: string
   levelOfStudy: string
   resumeUrl: string
   linkedInUrl: string
}

const baseOptions: Options<UserDataEntry> = {
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
   const { filters, documentPaths, converterFn, targetCollectionQuery } =
      useUserDataTable()

   const [rowsPerPage, setRowsPerPage] = useState(10)
   const [sortedTableColumn, setSortedTableColumn] =
      useState<SortedTableColumn>(null)

   const results = usePaginatedUsersCollection(
      targetCollectionQuery,
      documentPaths,
      rowsPerPage,
      sortedTableColumn,
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

   const data = useMemo(
      () => results.data?.map(converterFn) || [],
      [converterFn, results.data]
   )

   const options = useMemo<Options<UserDataEntry>>(
      () => ({
         ...baseOptions,
         pageSize: rowsPerPage,
      }),
      [rowsPerPage]
   )

   const columns = useMemo<Column<UserDataEntry>[]>(
      () => [
         {
            field: "firstName",
            title: "Full Name & Email",
            cellStyle: {
               minWidth: 180,
            },
            render: RenderFullNameAndEmailColumn,
            id: documentPaths.userFirstName,
         },
         {
            field: "universityCountryCode",
            title: "Country",
            lookup: universityCountriesMap,
            id: documentPaths.userUniversityCountryCode,
         },
         {
            field: "universityName",
            title: "University Name",
            cellStyle: {
               minWidth: 200,
            },
            id: documentPaths.userUniversityName,
         },
         {
            title: "Field Of Study",
            field: "fieldOfStudy",
            cellStyle: {
               minWidth: 200,
            },
            id: documentPaths.userFieldOfStudyName,
         },
         {
            title: "Level Of Study",
            field: "levelOfStudy",
            cellStyle: {
               minWidth: 100,
            },
            id: documentPaths.userFieldOfStudyName,
         },
         {
            field: "resume",
            title: "CV",
            type: "boolean",
            searchable: false,
            render: CVColumn,
            cellStyle: {
               width: 300,
            },
            id: documentPaths.userResume,
         },
         {
            render: RowActions,
            sorting: false,
            export: false,
         },
         {
            field: "email",
            title: "User Email",
            cellStyle: {
               minWidth: 150,
            },
            hidden: true,
            id: documentPaths.userEmail,
         },
         {
            field: "firstName",
            title: "First Name",
            hidden: true,
            cellStyle: {
               minWidth: 150,
            },
            id: documentPaths.userFirstName,
         },
         {
            hidden: true,
            field: "lastName",
            title: "Last Name",

            cellStyle: {
               minWidth: 150,
            },
            id: documentPaths.userLastName,
         },
      ],
      [
         documentPaths.userFieldOfStudyName,
         documentPaths.userFirstName,
         documentPaths.userLastName,
         documentPaths.userUniversityCountryCode,
         documentPaths.userUniversityName,
         documentPaths.userResume,
         documentPaths.userEmail,
      ]
   )

   const handlePageSizeChange = useCallback((pageSize: number) => {
      setRowsPerPage(pageSize)
   }, [])

   const handleSortModelChange = useCallback(
      (columnIndex: number, orderDirection: "asc" | "desc"): void => {
         // if columnIndex is -1, it means that the user clicked and toggled the sort off,
         // so we need to reset the sortedTableColumn
         if (columnIndex === -1) {
            setSortedTableColumn(null)
            return
         }

         const targetPathKey = columns[columnIndex]
            .id as keyof typeof documentPaths

         setSortedTableColumn({
            field: targetPathKey,
            direction: orderDirection,
         })
      },
      [columns]
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
            components={{
               Pagination: (props) => (
                  <Stack
                     overflow="auto"
                     px={4}
                     justifyContent="space-between"
                     direction={{ xs: "column", sm: "row" }}
                  >
                     <Stack
                        divider={<Divider orientation="vertical" flexItem />}
                        overflow="auto"
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={styles.actionsWrapper}
                     >
                        <Typography variant="body1" fontWeight={"500"}>
                           {results.countQueryResponse.count} talents found
                        </Typography>
                        <ResponsiveButton
                           text="Export All Users"
                           icon={<ExportIcon />}
                        />
                        <ResponsiveButton
                           text="Download All CVs"
                           icon={<DownloadIcon />}
                        />
                        <ResponsiveButton
                           text="Copy All Emails"
                           icon={<CopyIcon />}
                        />
                     </Stack>
                     <span>
                        <TablePagination {...props} />
                     </span>
                  </Stack>
               ),
            }}
         />
      </Box>
   )
}

type ResponsiveButtonProps = {
   text: string
   icon: ReactNode
}
const ResponsiveButton: FC<ResponsiveButtonProps> = ({ text, icon }) => {
   const isMobile = useIsMobile()

   return isMobile ? (
      <Tooltip title={text} placement="top" color="primary" arrow>
         <IconButton>{icon}</IconButton>
      </Tooltip>
   ) : (
      <Button size="small" color="primary" variant="text" startIcon={icon}>
         {text}
      </Button>
   )
}

const Toolbar: FC = () => {
   const { filters, resetFilters } = useUserDataTable()

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

const RenderFullNameAndEmailColumn = (rowData: UserDataEntry) => {
   return (
      <Box>
         <Typography gutterBottom fontWeight={600} variant="body1">
            {rowData.firstName} {rowData.lastName}
         </Typography>
         <Typography variant="body2" color="textSecondary">
            {rowData.email}
         </Typography>
      </Box>
   )
}

const CVColumn = (rowData: UserDataEntry) => {
   const { handleDownloadCV, downloading } = useDownloadCV(rowData)

   return rowData.resumeUrl ? (
      <Tooltip title={`Download CV for ${rowData.firstName}`}>
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
const RowActions = (rowData: UserDataEntry) => {
   return (
      <Stack alignItems="center" direction="row">
         <Box width={iconWidth}>
            {rowData.linkedInUrl ? (
               <IconButton
                  component="a"
                  href={rowData.linkedInUrl}
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

const skeletonColumns: Column<UserDataEntry>[] = [
   {
      field: "firstName",
      title: "Full Name & Email",
      cellStyle: {
         minWidth: 180,
      },
      render: RenderFullNameAndEmailColumn,
   },
   {
      field: "universityCountryCode",
      title: "Country",
      lookup: universityCountriesMap,
   },
   {
      field: "universityName",
      title: "University Name",
      cellStyle: {
         minWidth: 200,
      },
   },
   {
      title: "Field Of Study",
      field: "fieldOfStudy",
      cellStyle: {
         minWidth: 200,
      },
   },
   {
      title: "Level Of Study",
      field: "levelOfStudy",
      cellStyle: {
         minWidth: 100,
      },
   },
   {
      field: "resume",
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
]

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
            columns={skeletonColumns}
         />
      </Box>
   )
}

export default UserLivestreamDataTable
