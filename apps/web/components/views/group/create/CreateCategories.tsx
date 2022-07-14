import React, { useEffect, useState } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import CategoryEdit from "../admin/settings/Category/CategoryEdit"
import CategoryElement from "../admin/settings/Category/CategoryElement"
import AddIcon from "@mui/icons-material/Add"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      padding: (theme) => theme.spacing(2, 0),
   },
   title: {
      fontWeight: "300",
      color: "primary.main",
      fontSize: "calc(1.2em + 1.5vw)",
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
})

const CreateCategories = ({
   handleBack,
   handleDeleteLocalCategory,
   handleUpdateCategory,
   handleAddTempCategory,
   handleNext,
   arrayOfCategories,
}) => {
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

   const verifyNext = () => {
      handleNext()
   }

   return (
      <Grid sx={styles.root} container spacing={2}>
         <Grid item xs={12} sx={styles.header}>
            <Typography sx={styles.title}>Add some Categories</Typography>
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
                        isLocal={true}
                        category={null}
                        newCategory={true}
                        setEditMode={setCreateMode}
                     />
                  </Grid>
               )}
               {arrayOfCategories.map((category) => (
                  <Grid key={category.id} item xs={12}>
                     <CategoryElement
                        handleDeleteLocalCategory={handleDeleteLocalCategory}
                        isLocal={true}
                        handleUpdateCategory={handleUpdateCategory}
                        category={category}
                     />
                  </Grid>
               ))}
            </Grid>
         </Grid>
         <Grid item xs={12} sx={styles.buttons}>
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
