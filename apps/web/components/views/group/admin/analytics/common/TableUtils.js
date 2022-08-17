import React, { forwardRef, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import {
   getMinutes,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions"
import { Rating } from "@mui/material"
import { Box, Tooltip, Typography } from "@mui/material"

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

const useStyles = makeStyles((theme) => ({
   ratingInput: {
      display: "inline-flex",
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      paddingLeft: 20,
   },
   ratingText: {
      marginLeft: theme.spacing(1),
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   tableTooltipQuestion: {
      fontSize: theme.spacing(2),
   },
}))

export const getDate = (rowData, prop) => {
   return prettyDate(rowData[prop])
}
export const getCount = ({ value }) => {
   return value ? value.length : 0
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

export const RatingInputValue = ({ item, applyValue }) => {
   const classes = useStyles()

   const handleFilterChange = (event) => {
      applyValue({ ...item, value: event.target.value })
   }

   return (
      <div className={classes.ratingInput}>
         <Rating
            name="custom-rating-filter-operator"
            placeholder="Filter value"
            value={Number(item.value)}
            onChange={handleFilterChange}
            precision={0.5}
         />
      </div>
   )
}
export const StarRatingInputValue = ({ columnDef, onFilterChanged }) => {
   const [rating, setRating] = useState(0)
   return (
      <Box>
         <Typography component="legend">Up to:</Typography>
         <Rating
            name={`ratings-${columnDef.tableData.id}`}
            placeholder="Ratings lower than"
            value={rating}
            onChange={(event, value) => {
               setRating(value)
               onFilterChanged(columnDef.tableData.id, `${value}`)
            }}
            precision={0.5}
         />
      </Box>
   )
}

export const renderRating = ({ value, id }) => {
   return (
      <Box display="flex" alignItems="center">
         <Rating readOnly name={id} value={Number(value)} precision={0.5} />
         {value ? (
            <Typography
               style={{
                  marginLeft: 8,
                  color: "grey",
                  fontWeight: 500,
               }}
            >
               {value}
            </Typography>
         ) : null}
      </Box>
   )
}
export const renderRatingStars = ({ rating, id }) => {
   return (
      <Box display="flex" alignItems="center">
         <Rating readOnly name={id} value={Number(rating)} precision={0.5} />
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
      </Box>
   )
}

export const filterModel = {
   items: [
      // {columnField: 'rating', value: '3.5', operatorValue: '>='}
   ],
}
