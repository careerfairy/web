import React, { FC, ReactNode, useCallback, useMemo, useState } from "react"
import MaterialTable, {
   Column,
   Components,
   Localization,
   MaterialTableProps,
   MTableAction,
   Options,
} from "@material-table/core"
import { Query } from "@firebase/firestore"
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
   sorting: false,
}

const localization: Localization = {
   body: {
      emptyDataSourceMessage: "No users found",
   },
   header: {
      actions: "",
   },
}

const UserLivestreamDataTable = () => {
   const { filters, documentPaths, converterFn, targetCollectionQuery } =
      useUserDataTable()

   const [rowsPerPage, setRowsPerPage] = useState(10)

   const results = usePaginatedUsersCollection(
      targetCollectionQuery,
      documentPaths,
      rowsPerPage,
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

   const handlePageSizeChange = useCallback((pageSize: number) => {
      setRowsPerPage(pageSize)
   }, [])

   const customComponents = useMemo<Components>(
      () => ({
         Action: (props) => {
            if (props.action.icon === "custom") {
               return <CustomActions {...props.data} />
            }
            return <MTableAction {...props} />
         },
         Pagination: (props) => (
            <Footer
               emptyQuery={emptyQuery}
               paginationProps={props}
               fullQuery={results.fullQuery}
               totalUsers={results.countQueryResponse.count}
            />
         ),
      }),
      [emptyQuery, results.countQueryResponse.count, results.fullQuery]
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
            actions={actions}
            onRowsPerPageChange={handlePageSizeChange}
            totalCount={results.countQueryResponse.count ?? undefined}
            page={results.page - 1}
            onPageChange={handlePageChange}
            components={customComponents}
         />
      </Box>
   )
}

const actions: MaterialTableProps<UserDataEntry>["actions"] = [
   { icon: "custom", onClick: () => {} },
]

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
   const { converterFn, title, filters } = useUserDataTable()

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

   const noFiltersActive = Object.values(filters).every(
      (value) => (Array.isArray(value) && value.length === 0) || value === null
   )

   return (
      <>
         <Stack
            overflow="auto"
            px={4}
            justifyContent={"space-between"}
            spacing={1}
            direction={{
               xs: "column",
               lg: "row-reverse",
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
               {noFiltersActive ? null : (
                  <Typography variant="body1" fontWeight={"500"}>
                     {totalUsers || 0} talent found
                  </Typography>
               )}
               <ResponsiveButton
                  text="Export Talent"
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

const CustomActions = (rowData: UserDataEntry) => {
   const { handleDownloadCV, downloadingPDF } = useDownloadCV(rowData)

   return (
      <Stack direction="row" spacing={1} pr={1} alignItems="center">
         <Tooltip
            title={
               rowData.resumeUrl ? `Download ${rowData.firstName}'s CV` : ""
            }
            placement="top"
            color="primary"
            arrow
         >
            <span>
               <LoadingButton
                  disabled={!rowData.resumeUrl}
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
            </span>
         </Tooltip>
         <Tooltip
            title={
               rowData.linkedInUrl
                  ? `Go to ${rowData.firstName}'s LinkedIn`
                  : ""
            }
            placement="top"
            color="primary"
            arrow
         >
            <span>
               <IconButton
                  component="a"
                  disabled={!rowData.linkedInUrl}
                  href={rowData.linkedInUrl}
                  target="_blank"
                  sx={styles.linkedInIcon}
               >
                  <LinkedInIcon />
               </IconButton>
            </span>
         </Tooltip>
      </Stack>
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

const columns: Column<UserDataEntry>[] = [
   {
      field: "firstName",
      title: "Full Name & Email",
      cellStyle: {
         minWidth: 270,
      },
      render: RenderFullNameAndEmailColumn,
   },
   {
      field: "universityCountryCode",
      title: "Country",
      lookup: universityCountriesMap,
      cellStyle: {
         maxWidth: 100,
      },
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
         minWidth: 50,
      },
   },
   {
      title: "Level Of Study",
      field: "levelOfStudy",
      cellStyle: {
         minWidth: 30,
      },
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
            columns={columns}
         />
      </Box>
   )
}

export default UserLivestreamDataTable
