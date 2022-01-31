import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Card } from "@mui/material";
import { withFirebase } from "../../../../../../../context/firebase/FirebaseServiceContext";
import {
   defaultTableOptions,
   exportSelectionAction,
   getPageSize,
   renderRatingStars,
   StarRatingInputValue,
   tableIcons,
} from "../../common/TableUtils";
import { prettyDate } from "../../../../../../helperFunctions/HelperFunctions";
import { alpha, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import ExportTable from "../../../../../common/Tables/ExportTable";

const useStyles = makeStyles((theme) => ({
   root: {
      padding: 0,
   },
   actions: {
      justifyContent: "flex-end",
   },
   tableTooltipQuestion: {
      fontSize: theme.spacing(2),
   },
}));

const columns = [
   {
      field: "rating",
      title: "Rating",
      width: 160,
      render: renderRatingStars,
      filterComponent: StarRatingInputValue,
      customFilterAndSearch: (term, rowData) =>
         Number(term) >= Number(rowData.rating),
   },
   {
      field: "date",
      title: "Voted",
      width: 200,
      render: (rowData) => prettyDate(rowData.timestamp),
      type: "date",
   },
   {
      field: "message",
      title: "Message",
      width: 250,
   },
];

const RatingSideTable = ({
   currentRating,
   streamDataType,
   fetchingStreams,
   sideRef,
   className,
   ...rest
}) => {
   const dataTableRef = useRef(null);

   const theme = useTheme();
   const classes = useStyles();
   const [data, setData] = useState([]);

   useEffect(() => {
      if (currentRating?.voters?.length) {
         setData(currentRating.voters);
      } else {
         setData([]);
      }
   }, [currentRating]);

   useEffect(() => {
      if (dataTableRef.current) {
         dataTableRef.current.onAllSelected(false);
      }
   }, [currentRating?.id]);
   const active = () => {
      return Boolean(currentRating);
   };

   const customOptions = { ...defaultTableOptions };
   const innerTableStyle = {
      background: alpha(theme.palette.navyBlue.main, 0.05),
   };
   // customOptions.selection = false;
   customOptions.headerStyle = innerTableStyle;
   customOptions.exportButton.pdf = true;
   customOptions.pageSize = getPageSize(customOptions.pageSizeOptions, data);

   return (
      <Card
         raised={active()}
         ref={sideRef}
         className={clsx(classes.root, className)}
         {...rest}
      >
         <ExportTable
            key={data.length}
            icons={tableIcons}
            tableRef={dataTableRef}
            columns={[
               {
                  field: "rating",
                  title: "Rating",
                  width: 160,
                  render: renderRatingStars,
                  filterComponent: StarRatingInputValue,
                  customFilterAndSearch: (term, rowData) =>
                     Number(term) >= Number(rowData.rating),
               },
               {
                  field: "date",
                  title: "Voted",
                  width: 200,
                  render: (rowData) => prettyDate(rowData.timestamp),
                  type: "date",
               },
               {
                  field: "message",
                  title: "Message",
                  width: 250,
               },
            ]}
            data={data}
            options={customOptions}
            isLoading={fetchingStreams}
            actions={[exportSelectionAction(columns)]}
            title={currentRating?.question}
         />
      </Card>
   );
};

RatingSideTable.propTypes = {
   className: PropTypes.string,
};

export default withFirebase(RatingSideTable);
