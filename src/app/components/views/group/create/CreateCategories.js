import React, { Fragment, useEffect, useState } from "react";
import { Box, Button, Container, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CategoryEdit from "../admin/settings/Category/CategoryEdit";
import CategoryElement from "../admin/settings/Category/CategoryElement";
import AddIcon from "@material-ui/icons/Add";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   root: {
      paddingTop: "50px",
      paddingBottom: "50px",
   },
   title: {
      fontWeight: "300",
      color: "rgb(0, 210, 170)",
      fontSize: "calc(1.2em + 1.5vw)",
   },
   categories: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
   },
   error: {
      color: "red",
      fontWeight: "lighter",
      fontSize: "1rem",
   },
   header: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-end",
   },
   buttons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
   },
}));

const CreateCategories = ({
   handleBack,
   handleDeleteLocalCategory,
   handleUpdateCategory,
   handleAddTempCategory,
   handleNext,
   arrayOfCategories,
}) => {
   const classes = useStyles();
   const [createMode, setCreateMode] = useState(false);

   useEffect(() => {
      if (!arrayOfCategories.length) {
         setCreateMode(true);
      }
   }, []);

   useEffect(() => {
      if (!createMode && !arrayOfCategories.length) {
         setCreateMode(true);
      }
   });

   const groupId = "temp";

   const categoryElements = arrayOfCategories.map((category, index) => {
      return (
         <div key={index}>
            <CategoryElement
               handleDeleteLocalCategory={handleDeleteLocalCategory}
               isLocal={true}
               handleUpdateCategory={handleUpdateCategory}
               category={category}
            />
         </div>
      );
   });

   const verifyNext = () => {
      handleNext();
   };

   return (
      <Container className={classes.root}>
         <div className={classes.header}>
            <Typography className={classes.title}>
               Add some Categories
            </Typography>
            <Box>
               <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setCreateMode(true)}
                  disabled={createMode}
                  endIcon={<AddIcon />}
               >
                  Add
               </Button>
            </Box>
         </div>
         <Box className={classes.categories}>
            {createMode && (
               <CategoryEdit
                  handleAddTempCategory={handleAddTempCategory}
                  groupId={groupId}
                  isLocal={true}
                  category={{}}
                  options={[]}
                  newCategory={true}
                  setEditMode={setCreateMode}
               />
            )}
            {categoryElements}
         </Box>
         <Box className={classes.buttons}>
            <Button
               variant="contained"
               size="large"
               style={{ marginRight: 5 }}
               startIcon={<ArrowBackIcon />}
               onClick={handleBack}
            >
               Back
            </Button>

            <Button
               color="primary"
               size="large"
               variant="contained"
               style={{ marginLeft: 5 }}
               endIcon={<ArrowForwardIcon />}
               onClick={verifyNext}
            >
               Next
            </Button>
         </Box>
      </Container>
   );
};

export default CreateCategories;
