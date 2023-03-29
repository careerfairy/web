import React, { FC, ReactNode, useCallback, useMemo, useState } from "react"
import MaterialTable, {
   Column,
   Localization,
   Options,
} from "@material-table/core"
import { OrderByDirection, Query } from "@firebase/firestore"
import {
   Box,
   CircularProgress,
   Divider,
   Grid,
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
import {
   useCopyAllEmails,
   useDownloadAllCVs,
   useDownloadCV,
   useExportUsers,
} from "./hooks"
import { CountriesSelect } from "./CountriesSelect"
import UniversitySelect from "./UniversitySelect"
import FieldOfStudySelect from "./FieldOfStudySelect"
import LevelOfStudySelect from "./LevelOfStudySelect"
import ResetFiltersIcon from "@mui/icons-material/RotateLeft"
import CopyIcon from "@mui/icons-material/ContentCopy"
import { useUserDataTable } from "./UserDataTableProvider"
import ExportIcon from "@mui/icons-material/ListAltOutlined"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { CSVDialogDownload } from "../../../../../custom-hook/useMetaDataActions"

export type SortedTableColumn = {
   field: string
   direction: OrderByDirection
}

const styles = sxStyles({
   root: {
      width: "-webkit-fill-available",
      "& button": {},
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
      overflow: "auto",
   },
   gridRoot: (theme) => ({
      p: 2,
      pr: 0,
      "& .MuiGrid-item": {
         "&:not(:last-child)": {
            borderRight: {
               xl: `1px solid ${theme.palette.divider}`,
               xs: "none",
            },
         },
      },
   }),
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
   universityCountryName: string
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

   const emptyQuery = results.countQueryResponse?.count === 0

   const data = useMemo(
      () => results.data?.map(converterFn) || [],
      [converterFn, results.data]
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

   const options = useMemo<Options<UserDataEntry>>(
      () => ({
         ...baseOptions,
         pageSize: rowsPerPage,
      }),
      [rowsPerPage]
   )

   // When sorted by CV, change the title to "With CV" since the query filters out users without CV
   const CVColumnTitle = useMemo<string>(() => {
      let title = "CV"
      if (sortedTableColumn?.field === documentPaths.userResume) {
         title = "With CV"
      }
      return title
   }, [sortedTableColumn, documentPaths.userResume])

   // When sorted by LinkedIn, change the title to "With LinkedIn" since the query filters out users without LinkedIn
   const linkedInColumnTitle = useMemo<string>(() => {
      let title = "LinkedIn"
      if (sortedTableColumn?.field === documentPaths.userLinkedIn) {
         title = "With LinkedIn"
      }
      return title
   }, [sortedTableColumn, documentPaths.userLinkedIn])

   const columns = useMemo<Column<UserDataEntry>[]>(
      () => [
         {
            field: "firstName",
            title: "Full Name & Email",
            cellStyle: {
               minWidth: 270,
            },
            render: RenderFullNameAndEmailColumn,
            id: documentPaths.userFirstName,
            sorting: false,
         },
         {
            field: "universityCountryCode",
            title: "Country",
            sorting: false,
            lookup: universityCountriesMap,
            id: documentPaths.userUniversityCountryCode,
            cellStyle: {
               maxWidth: 100,
            },
         },
         {
            field: "universityName",
            title: "University Name",
            sorting: false,
            cellStyle: {
               minWidth: 260,
            },
            id: documentPaths.userUniversityName,
         },
         {
            title: "Field Of Study",
            field: "fieldOfStudy",
            sorting: false,
            cellStyle: {
               minWidth: 100,
            },
            id: documentPaths.userFieldOfStudyName,
         },
         {
            title: "Level Of Study",
            field: "levelOfStudy",
            sorting: false,
            cellStyle: {
               minWidth: 0,
            },
            id: documentPaths.userFieldOfStudyName,
         },
         {
            field: "resume",
            title: CVColumnTitle,
            type: "boolean",
            render: CVColumn,
            cellStyle: {
               minWidth: 0,
            },
            id: documentPaths.userResume,
         },
         {
            field: "linkedInUrl",
            title: linkedInColumnTitle,
            type: "boolean",
            render: LinkedInColumn,
            cellStyle: {
               minWidth: 0,
            },
            id: documentPaths.userResume,
         },
         {
            field: "email",
            title: "User Email",
            hidden: true,
            id: documentPaths.userEmail,
         },
         {
            field: "firstName",
            title: "First Name",
            hidden: true,
            id: documentPaths.userFirstName,
         },
         {
            hidden: true,
            field: "lastName",
            title: "Last Name",
            id: documentPaths.userLastName,
         },
      ],
      [
         documentPaths.userFirstName,
         documentPaths.userUniversityCountryCode,
         documentPaths.userUniversityName,
         documentPaths.userFieldOfStudyName,
         documentPaths.userResume,
         documentPaths.userEmail,
         documentPaths.userLastName,
         CVColumnTitle,
         linkedInColumnTitle,
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
                  <Footer
                     emptyQuery={emptyQuery}
                     paginationProps={props}
                     fullQuery={results.fullQuery}
                     totalUsers={results.countQueryResponse.count}
                  />
               ),
            }}
         />
      </Box>
   )
}

type FooterProps = {
   paginationProps: any
   emptyQuery: boolean
   fullQuery: Query
   totalUsers: number
}
const Footer: FC<FooterProps> = ({
   fullQuery,
   paginationProps,
   emptyQuery,
   totalUsers,
}) => {
   const { converterFn, title } = useUserDataTable()

   const { downloadingAllCVs, handleDownloadAllCVs } = useDownloadAllCVs(
      fullQuery,
      converterFn,
      title
   )
   const { copyingEmails, handleCopyAllEmails } = useCopyAllEmails(
      fullQuery,
      converterFn
   )

   const {
      exportingUsers,
      csvDownloadData,
      handleExportUsers,
      handleCloseCsvDialog,
   } = useExportUsers(fullQuery, converterFn, title)

   return (
      <>
         <Stack
            overflow="auto"
            px={4}
            justifyContent={"space-between"}
            spacing={1}
            direction={{
               xs: "column",
               xl: "row-reverse",
            }}
         >
            <span>
               <TablePagination {...paginationProps} />
            </span>
            <Stack
               divider={<Divider orientation="vertical" flexItem />}
               overflow="auto"
               direction="row"
               alignItems="center"
               spacing={2}
               sx={styles.actionsWrapper}
            >
               <Typography variant="body1" fontWeight={"500"}>
                  {emptyQuery
                     ? "No talents found"
                     : `${totalUsers} talents found`}
               </Typography>
               <ResponsiveButton
                  text="Export Talents"
                  disabled={emptyQuery}
                  onClick={handleExportUsers}
                  loading={exportingUsers}
                  icon={<ExportIcon />}
               />
               <ResponsiveButton
                  disabled={emptyQuery}
                  text="Download CVs"
                  onClick={handleDownloadAllCVs}
                  loading={downloadingAllCVs}
                  icon={<DownloadIcon />}
               />
               <ResponsiveButton
                  disabled={emptyQuery}
                  text="Copy Emails"
                  onClick={handleCopyAllEmails}
                  loading={copyingEmails}
                  icon={<CopyIcon />}
               />
            </Stack>
         </Stack>
         {csvDownloadData ? (
            <CSVDialogDownload
               title={csvDownloadData.title.replace("_", " ")}
               data={csvDownloadData.data}
               filename={`${title}.csv`}
               defaultOpen={!!csvDownloadData}
               onClose={handleCloseCsvDialog}
            />
         ) : null}
      </>
   )
}

type ResponsiveButtonProps = {
   text: string
   icon: ReactNode
   disabled?: boolean
   loading?: boolean
   onClick?: () => void
}
const ResponsiveButton: FC<ResponsiveButtonProps> = ({
   text,
   icon,
   loading,
   disabled,
   onClick,
}) => {
   const isMobile = useIsMobile()

   return isMobile ? (
      <Tooltip title={text} placement="top" color="primary" arrow>
         <span>
            <IconButton
               color="primary"
               onClick={onClick}
               disabled={disabled || loading}
            >
               {loading ? <CircularProgress color="inherit" size={20} /> : icon}
            </IconButton>
         </span>
      </Tooltip>
   ) : (
      <LoadingButton
         onClick={onClick}
         size="small"
         loading={loading}
         disabled={disabled}
         color="primary"
         variant="text"
         startIcon={icon}
      >
         {text}
      </LoadingButton>
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
         <Grid sx={styles.gridRoot} spacing={1} container>
            <Grid item xs={12} md={6} xl={3}>
               <CountriesSelect />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
               <UniversitySelect />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
               <FieldOfStudySelect />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
               <LevelOfStudySelect />
            </Grid>
         </Grid>
         <Box sx={{ flexGrow: 1 }} />
         <Tooltip title="Reset Filters">
            <Box p={2} pl={0}>
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
   const { handleDownloadCV, downloadingPDF } = useDownloadCV(rowData)

   return rowData.resumeUrl ? (
      <Tooltip title={`Download CV for ${rowData.firstName}`}>
         <LoadingButton
            loading={downloadingPDF}
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
const LinkedInColumn = (rowData: UserDataEntry) => {
   return rowData.linkedInUrl ? (
      <IconButton
         component="a"
         href={rowData.linkedInUrl}
         target="_blank"
         sx={styles.linkedInIcon}
      >
         <LinkedInIcon />
      </IconButton>
   ) : null
}

const skeletonColumns: Column<UserDataEntry>[] = [
   {
      field: "firstName",
      title: "Full Name & Email",
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
   },
   {
      title: "Field Of Study",
      field: "fieldOfStudy",
   },
   {
      title: "Level Of Study",
      field: "levelOfStudy",
   },
   {
      field: "resume",
      title: "CV",
      type: "boolean",
      searchable: false,
      render: CVColumn,
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
