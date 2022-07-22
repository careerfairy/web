import React, { useEffect, useState } from "react"
import { Box, Button, Grid, Typography } from "@mui/material"
import GroupQuestionEdit from "../admin/settings/GroupQuestion/GroupQuestionEdit"
import GroupQuestionElement from "../admin/settings/GroupQuestion/GroupQuestionElement"
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

const CreateGroupQuestions = ({
   handleBack,
   handleDeleteLocalGroupQuestion,
   handleUpdateGroupQuestion,
   handleAddTempGroupQuestion,
   handleNext,
   groupQuestions,
}) => {
   const [createMode, setCreateMode] = useState(false)

   useEffect(() => {
      if (!groupQuestions.length) {
         setCreateMode(true)
      }
   }, [])

   useEffect(() => {
      if (!createMode && !groupQuestions.length) {
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
                     <GroupQuestionEdit
                        handleAddTempGroupQuestion={handleAddTempGroupQuestion}
                        isLocal={true}
                        groupQuestion={null}
                        newGroupQuestion={true}
                        setEditMode={setCreateMode}
                     />
                  </Grid>
               )}
               {groupQuestions.map((category) => (
                  <Grid key={category.id} item xs={12}>
                     <GroupQuestionElement
                        handleDeleteLocalGroupQuestion={
                           handleDeleteLocalGroupQuestion
                        }
                        isLocal={true}
                        handleUpdateGroupQuestion={handleUpdateGroupQuestion}
                        GroupQuestion={category}
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

export default CreateGroupQuestions
