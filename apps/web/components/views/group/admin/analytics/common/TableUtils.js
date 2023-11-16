/* eslint-disable react/display-name */
import React, { forwardRef, useCallback, useState } from "react"
import { getMinutes } from "../../../../../helperFunctions/HelperFunctions"
import { Box, Rating, Typography } from "@mui/material"

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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { getCSVDelimiterBasedOnOS } from "../../../../../../util/CommonUtil"
import SentimentRating from "../../../../viewer/rating-container/SentimentRating"
import NormalRating from "../../../../viewer/rating-container/NormalRating"

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
   DeleteForeverOutlinedIcon: forwardRef((props, ref) => (
      <DeleteForeverOutlinedIcon {...props} ref={ref} />
   )),
   PictureAsPdfIcon: forwardRef((props, ref) => (
      <PictureAsPdfIcon {...props} ref={ref} />
   )),
}

export const customDonutConfig = [
   {
      display: false,
      fontStyle: "bold",
      textShadow: true,
      overlap: true,
      fontColor: "white",
      render: ({ percentage }) => {
         // args will be something like:
         // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
         return percentage > 2 ? percentage + "%" : ""
         // return object if it is image
         // return { src: 'image.png', width: 16, height: 16 };
      },
   },
]

export const defaultTableOptions = {
   filtering: true,
   selection: true,
   pageSize: 5,
   columnsButton: true,
   pageSizeOptions: [3, 5, 10, 25, 50, 100, 200],
   minBodyHeight: 200,
   exportAllData: true,
   exportDelimiter: getCSVDelimiterBasedOnOS(),
   exportButton: { csv: true, pdf: true }, // PDF is false because its buggy and throws errors
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

export const renderAppearAfter = ({ appearAfter }) => {
   return (
      <Typography variant="inherit" noWrap>
         {getMinutes(appearAfter)}
      </Typography>
   )
}

export const StarRatingInputValue = ({ columnDef, onFilterChanged }) => {
   const [rating, setRating] = useState(0)
   const onChange = useCallback(
      (event, newValue) => {
         setRating(newValue)
         onFilterChanged(columnDef?.field, newValue)
      },
      [columnDef, onFilterChanged]
   )
   const name = `ratings-${columnDef?.tableData?.id}`

   return (
      <Box>
         <Typography component="legend">Up to:</Typography>
         <Rating
            name={name}
            placeholder="Ratings lower than"
            value={rating}
            onChange={onChange}
            precision={0.5}
         />
      </Box>
   )
}

export const renderRatingStars = ({ id, isSentimentRating, rating }) => {
   return (
      <Box display="flex" alignItems="center">
         {isSentimentRating ? (
            <SentimentRating name={id} value={Number(rating)} readOnly />
         ) : (
            <>
               <NormalRating
                  readOnly
                  name={id}
                  value={Number(rating)}
                  precision={0.5}
               />
               {Number(rating) > 0 && (
                  <Typography
                     style={{
                        marginLeft: 8,
                        color: "grey",
                        fontWeight: 500,
                     }}
                  >
                     {rating}
                  </Typography>
               )}
            </>
         )}
      </Box>
   )
}
