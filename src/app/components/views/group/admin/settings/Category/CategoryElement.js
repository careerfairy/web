import PropTypes from "prop-types";
import React, { Fragment, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import { withFirebase } from "context/firebase";
import CategoryEdit from "./CategoryEdit";
import {
   Card,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   Fade,
   IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   whiteBox: {
      backgroundColor: "white",
      borderRadius: "5px",
      padding: "20px",
      margin: "10px 0",
      textAlign: "left",
      display: "flex",
      flexWrap: "wrap",
      position: "relative",
   },
   icon: {
      position: "absolute",
      top: 10,
      right: 10,
   },
   label: {
      fontSize: "0.8em",
      fontWeight: "700",
      color: "rgb(160,160,160)",
      margin: "0 0 5px 0",
   },
   title: {
      fontSize: "1.2em",
      fontWeight: "700",
      color: "rgb(80,80,80)",
   },
   headerTitle: {},
}));

function CategoryElement({
   handleUpdateCategory,
   category,
   firebase,
   handleAddTempCategory,
   handleDeleteLocalCategory,
   group,
   isLocal,
}) {
   const classes = useStyles();
   const [editMode, setEditMode] = useState(false);

   const dynamicSort = (property) => {
      let sortOrder = 1;
      if (property[0] === "-") {
         sortOrder = -1;
         property = property.substr(1);
      }
      return function (a, b) {
         /* next line works with strings and numbers,
          * and you may want to customize it to your needs
          */
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
         return result * sortOrder;
      };
   };

   let sortedOptions = [];

   sortedOptions = [...category.options]?.sort(dynamicSort("name"));

   const optionElements = sortedOptions.map((option, index) => {
      return (
         <Chip
            key={option.id || index}
            label={option.name}
            variant="outlined"
         />
      );
   });

   if (editMode === false) {
      return (
         <Fade in>
            <Card elevation={2}>
               <CardHeader
                  titleTypographyProps={{
                     className: classes.headerTitle,
                     gutterBottom: true,
                  }}
                  title={category.name}
                  action={
                     <IconButton
                        onClick={() => setEditMode(true)}
                        aria-label="settings"
                     >
                        <EditIcon color="primary" />
                     </IconButton>
                  }
                  subheader="Category Options"
               />
               <Divider />
               <CardContent>{optionElements}</CardContent>
            </Card>
         </Fade>
      );
   }

   return (
      <Fragment>
         <CategoryEdit
            group={group}
            isLocal={isLocal}
            handleUpdateCategory={handleUpdateCategory}
            handleAddTempCategory={handleAddTempCategory}
            handleDeleteLocalCategory={handleDeleteLocalCategory}
            category={category}
            setEditMode={setEditMode}
         />
      </Fragment>
   );
}

CategoryElement.propTypes = {
   category: PropTypes.any,
   firebase: PropTypes.object,
   group: PropTypes.object,
   handleAddTempCategory: PropTypes.func,
   handleDeleteLocalCategory: PropTypes.func,
   handleUpdateCategory: PropTypes.func,
   isLocal: PropTypes.bool,
};
export default withFirebase(CategoryElement);
