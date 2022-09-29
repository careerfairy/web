import React, { useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions"
import MaterialTable from "@material-table/core"
import { defaultTableOptions, tableIcons } from "../../../../../util/tableUtils"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/dist/utils"

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      height: 500,
      backgroundColor: theme.palette.background.paper,
   },
   streamCompanyLogo: {
      // height: 70,
      // width: "80%",
      "& img": {
         objectFit: "contain",
      },
      // padding: theme.spacing(1),
      // background: theme.palette.common.white
   },
   avatar: {
      // height: 70,
      // width: "80%",
      "& img": {
         objectFit: "contain",
      },
      background: theme.palette.common.white,
   },
}))

const columns = [
   {
      field: "title",
      title: "Title",
      description: "Title of the event",
      flex: 1,
   },
   {
      field: "company",
      title: "Company",
      description: "Company of the event",
      flex: 1,
   },
   {
      field: "date",
      title: "Date",
      flex: 0.2,
      render: (params) => {
         return prettyDate(params.start)
      },
      type: "date",
   },
]

const getSelectedStreamIds = (streams, hiddenStreamIds) => {
   return streams
      .filter((stream) => !hiddenStreamIds?.[stream.id])
      .map((stream) => stream.id)
}

const StreamList = ({
   hiddenStreamIds,
   setNewVisibleStreamSelection,
   streamsFromStore,
}) => {
   const classes = useStyles()
   const [selectionModel, setSelectionModel] = useState([])
   const [streamsWithSelections, setStreamsWithSelections] = useState([])

   useEffect(() => {
      const selectedStreamIds = getSelectedStreamIds(
         streamsFromStore,
         hiddenStreamIds
      )
      setSelectionModel(selectedStreamIds)
      setNewVisibleStreamSelection(selectedStreamIds)
   }, [])

   useEffect(() => {
      let newStreamsWithSelections
      const selectionModelMap = new Set(selectionModel)
      if (!streamsFromStore?.length) {
         newStreamsWithSelections = []
      } else {
         newStreamsWithSelections = streamsFromStore
            .map((stream) => ({
               ...stream,
               tableData: {
                  ...(stream.tableData && stream.tableData),
                  checked: selectionModelMap.has(stream.id),
               },
            }))
            .sort(sortLivestreamsDesc)
      }
      setStreamsWithSelections(newStreamsWithSelections)
   }, [streamsFromStore, selectionModel])

   return (
      <div className={classes.root}>
         <MaterialTable
            style={{
               boxShadow: "none",
            }}
            columns={columns}
            data={streamsWithSelections}
            options={defaultTableOptions}
            icons={tableIcons}
            onSelectionChange={(selectedStreams) => {
               setNewVisibleStreamSelection(
                  selectedStreams.map((stream) => stream.id)
               )
            }}
         />
      </div>
   )
}
export default StreamList
