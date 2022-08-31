import React, { useState } from "react"
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   Grid,
   Grow,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import GroupQuestionElement from "../settings/GroupQuestion/GroupQuestionElement"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import GroupQuestionEdit from "../settings/GroupQuestion/GroupQuestionEdit"

const ProfileCategories = () => {
   const { group, groupQuestions } = useGroup()
   const [createMode, setCreateMode] = useState(false)

   return (
      <Card>
         <Box display="flex" justifyContent="space-between">
            <CardHeader
               title="Event Registration Questions"
               subheader="The information can be edited"
            />
            <Box p={2} display="flex" alignItems="flex-end">
               <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => setCreateMode(true)}
                  disabled={createMode}
                  endIcon={<AddIcon />}
               >
                  Add a question
               </Button>
            </Box>
         </Box>
         <Divider />
         <CardContent>
            <Grid container spacing={3}>
               <Grow unmountOnExit in={createMode}>
                  <Grid item md={12} xs={12}>
                     <GroupQuestionEdit
                        group={group}
                        setEditMode={setCreateMode}
                        newGroupQuestion
                     />
                  </Grid>
               </Grow>

               {groupQuestions.map((category) => (
                  <Grid item md={12} xs={12} key={category.id}>
                     <GroupQuestionElement
                        group={group}
                        GroupQuestion={category}
                     />
                  </Grid>
               ))}
            </Grid>
         </CardContent>
         <Divider />
      </Card>
   )
}

export default ProfileCategories
