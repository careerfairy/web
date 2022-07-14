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
import CategoryElement from "../settings/Category/CategoryElement"
import CategoryEdit from "../settings/Category/CategoryEdit"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const ProfileCategories = () => {
   const { group, customCategories } = useGroup()
   const [createMode, setCreateMode] = useState(false)

   return (
      <Card>
         <Box display="flex" justifyContent="space-between">
            <CardHeader
               title="Categories"
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
                  Add Category
               </Button>
            </Box>
         </Box>
         <Divider />
         <CardContent>
            <Grid container spacing={3}>
               <Grow unmountOnExit in={createMode}>
                  <Grid item md={12} xs={12}>
                     <CategoryEdit
                        group={group}
                        newCategory={true}
                        setEditMode={setCreateMode}
                     />
                  </Grid>
               </Grow>

               {customCategories.map((category) => (
                  <Grid item md={12} xs={12} key={category.id}>
                     <CategoryElement group={group} category={category} />
                  </Grid>
               ))}
            </Grid>
         </CardContent>
         <Divider />
      </Card>
   )
}

export default ProfileCategories
