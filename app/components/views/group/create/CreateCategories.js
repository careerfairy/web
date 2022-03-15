import React, { useEffect, useState } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import CategoryEdit from "../admin/settings/Category/CategoryEdit"
import CategoryElement from "../admin/settings/Category/CategoryElement"
import AddIcon from "@mui/icons-material/Add"
import makeStyles from "@mui/styles/makeStyles"

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(2, 0),
   },
   title: {
      fontWeight: "300",
      color: "rgb(0, 210, 170)",
      fontSize: "calc(1.2em + 1.5vw)",
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
   },
}))

const CreateCategories = ({
   handleBack,
   handleDeleteLocalCategory,
   handleUpdateCategory,
   handleAddTempCategory,
   handleNext,
   arrayOfCategories,
}) => {
   const classes = useStyles()
   const [createMode, setCreateMode] = useState(false)

   useEffect(() => {
      if (!arrayOfCategories.length) {
         setCreateMode(true)
      }
   }, [])

   useEffect(() => {
      if (!createMode && !arrayOfCategories.length) {
         setCreateMode(true)
      }
   })

   const groupId = "temp"

   const categoryElements = arrayOfCategories.map((category, index) => (
      <Grid key={category.id} item xs={12}>
         <CategoryElement
            handleDeleteLocalCategory={handleDeleteLocalCategory}
            isLocal={true}
            handleUpdateCategory={handleUpdateCategory}
            category={category}
         />
      </Grid>
   ))

   const verifyNext = () => {
      handleNext()
   }

   return (
      <Grid className={classes.root} container spacing={2}>
         <Grid item xs={12} className={classes.header}>
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
         </Grid>
         <Grid item xs={12}>
            <Grid container spacing={2}>
               {createMode && (
                  <Grid item xs={12}>
                     <CategoryEdit
                        handleAddTempCategory={handleAddTempCategory}
                        groupId={groupId}
                        isLocal={true}
                        category={{}}
                        options={[]}
                        newCategory={true}
                        setEditMode={setCreateMode}
                     />
                  </Grid>
               )}
               {categoryElements}
            </Grid>
         </Grid>
         <Grid item xs={12} className={classes.buttons}>
            <Button
               variant="contained"
               size="large"
               style={{ marginRight: 5 }}
               onClick={handleBack}
            >
               Back
            </Button>

            <Button
               color="primary"
               size="large"
               style={{ marginLeft: 5 }}
               variant="contained"
               onClick={verifyNext}
            >
               Continue
            </Button>
         </Grid>
      </Grid>
   )
}

export default CreateCategories
