/* eslint-disable react/display-name */
// @ts-nocheck
import React, { forwardRef } from "react"
import { getMinutes, prettyDate } from "../../helperFunctions/HelperFunctions"
import { Tooltip, Typography } from "@mui/material"
import { CsvBuilder } from "filefy"

import AddBox from "@mui/icons-material/AddBox"
import ArrowDownward from "@mui/icons-material/ArrowDownward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import Check from "@mui/icons-material/Check"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import ChevronRight from "@mui/icons-material/ChevronRight"
import Clear from "@mui/icons-material/Clear"
import DeleteOutline from "@mui/icons-material/DeleteOutline"
import Edit from "@mui/icons-material/Edit"
import EditIcon from "@mui/icons-material/Edit"
import FilterList from "@mui/icons-material/FilterList"
import FirstPage from "@mui/icons-material/FirstPage"
import LastPage from "@mui/icons-material/LastPage"
import Remove from "@mui/icons-material/Remove"
import SaveAlt from "@mui/icons-material/SaveAlt"
import Search from "@mui/icons-material/Search"
import ViewColumn from "@mui/icons-material/ViewColumn"
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined"
import InsertChartIcon from "@mui/icons-material/InsertChart"
import BallotIcon from "@mui/icons-material/Ballot"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import EmailIcon from "@mui/icons-material/Email"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary"
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos"
import SettingsIcon from "@mui/icons-material/Settings"
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined"
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined"
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"
import AllInboxIcon from "@mui/icons-material/AllInbox"
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { getCSVDelimiterBasedOnOS } from "../../../util/CommonUtil"
import { Options } from "@material-table/core"

export const tableIcons = {
   Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
   ThemedAdd: forwardRef((props, ref) => (
      <AddBox color="primary" {...props} ref={ref} />
   )),
   Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
   Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
   Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
   DetailPanel: forwardRef((props, ref) => (
      <ChevronRight {...props} ref={ref} />
   )),
   Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
   Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
   Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
   FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
   LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
   NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
   PreviousPage: forwardRef((props, ref) => (
      <ChevronLeft {...props} ref={ref} />
   )),
   ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
   Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
   SortArrow: forwardRef((props, ref) => (
      <ArrowDownward {...props} ref={ref} />
   )),
   ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
   ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
   InsertChartIcon: forwardRef((props, ref) => (
      <InsertChartIcon color="primary" {...props} ref={ref} />
   )),
   InsertChartOutlinedIcon: forwardRef((props, ref) => (
      <InsertChartOutlinedIcon {...props} ref={ref} />
   )),
   BallotIcon: forwardRef((props, ref) => <BallotIcon {...props} ref={ref} />),
   ArrowDownwardIcon: forwardRef((props, ref) => (
      <ArrowDownwardIcon {...props} ref={ref} />
   )),
   EditIcon: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />),
   ThemedEditIcon: forwardRef((props, ref) => (
      <EditIcon color="primary" {...props} ref={ref} />
   )),
   EditOutlinedIcon: forwardRef((props, ref) => (
      <EditOutlinedIcon {...props} ref={ref} />
   )),
   EmailIcon: forwardRef((props, ref) => <EmailIcon {...props} ref={ref} />),
   LinkedInIcon: forwardRef((props, ref) => (
      <LinkedInIcon {...props} ref={ref} />
   )),
   VideoLibraryIcon: forwardRef((props, ref) => (
      <VideoLibraryIcon {...props} ref={ref} />
   )),
   AddToPhotosIcon: forwardRef((props, ref) => (
      <AddToPhotosIcon {...props} ref={ref} />
   )),
   SettingsIcon: forwardRef((props, ref) => (
      <SettingsIcon {...props} ref={ref} />
   )),
   VideoLibraryOutlinedIcon: forwardRef((props, ref) => (
      <VideoLibraryOutlinedIcon {...props} ref={ref} />
   )),
   LibraryAddOutlinedIcon: forwardRef((props, ref) => (
      <LibraryAddOutlinedIcon {...props} ref={ref} />
   )),
   DeleteForeverIcon: forwardRef((props, ref) => (
      <DeleteForeverIcon {...props} ref={ref} />
   )),
   RedDeleteForeverIcon: forwardRef((props, ref) => (
      <DeleteForeverIcon color="error" {...props} ref={ref} />
   )),
   RotateLeftIcon: forwardRef((props, ref) => (
      <RotateLeftIcon {...props} ref={ref} />
   )),
   RemoveCircleOutlineIcon: forwardRef((props, ref) => (
      <RemoveCircleOutlineIcon {...props} ref={ref} />
   )),
   SupervisorAccountIcon: forwardRef((props, ref) => (
      <SupervisorAccountIcon {...props} ref={ref} />
   )),
   DeleteForeverOutlinedIcon: forwardRef((props, ref) => (
      <DeleteForeverOutlinedIcon {...props} ref={ref} />
   )),
   AllInboxIcon: forwardRef((props, ref) => (
      <AllInboxIcon {...props} ref={ref} />
   )),
   AlternateEmailIcon: forwardRef((props, ref) => (
      <AlternateEmailIcon {...props} ref={ref} />
   )),
   MoreVertIcon: forwardRef((props, ref) => (
      <MoreVertIcon {...props} ref={ref} />
   )),
}

export const exportSelectionAction = (
   columns = [],
   title = "Selected_Table",
   setCsvDownloadData = null
) => {
   return {
      position: "toolbarOnSelect",
      icon: SaveAlt,
      tooltip: "Export the selected rows!",
      onClick: (e, rowData) => {
         const tableTitle = title.split(" ").join("_")

         if (!setCsvDownloadData) {
            const builder = new CsvBuilder(tableTitle + ".csv")
            builder
               .setDelimeter(getCSVDelimiterBasedOnOS())
               .setColumns(columns.map((columnDef) => columnDef.title))
               .addRows(
                  rowData.map((rowData) =>
                     columns.map((columnDef) => rowData[columnDef.field])
                  )
               )
               .exportFile()
            return
         }

         setCsvDownloadData({
            data: rowData.map((rowData) =>
               columns
                  .map((columnDef) => ({
                     title: columnDef.title,
                     value: rowData[columnDef.field],
                  }))
                  .reduce((a, v) => ({ ...a, [v.title]: v.value }), {})
            ),
            title: title,
            filename: tableTitle,
         })
      },
   }
}

export const defaultTableOptions: Options<any> = {
   filtering: true,
   selection: true,
   pageSize: 5,
   columnsButton: true,
   pageSizeOptions: [3, 5, 10, 25, 50, 100, 200],
   minBodyHeight: 200,
   exportAllData: true,
   searchFieldVariant: "standard",
}

export const getPageSize = (pageSizeOptions = [], totalData = []) => {
   const numEntries = totalData.length
   return pageSizeOptions.find(
      (option, index) =>
         (option < numEntries && pageSizeOptions[index + 1] >= numEntries) ||
         numEntries <= pageSizeOptions[0] ||
         option === pageSizeOptions[pageSizeOptions.length - 1]
   )
}

export const getDate = (rowData, prop) => {
   return prettyDate(rowData[prop])
}
export const renderLongText = ({ value }) => {
   return (
      <Tooltip
         title={<Typography style={{ fontSize: "1.2rem" }}>{value}</Typography>}
      >
         <Typography variant="inherit" noWrap>
            {value}
         </Typography>
      </Tooltip>
   )
}

export const renderAppearAfter = ({ appearAfter }) => {
   return (
      <Typography variant="inherit" noWrap>
         {getMinutes(appearAfter)}
      </Typography>
   )
}
