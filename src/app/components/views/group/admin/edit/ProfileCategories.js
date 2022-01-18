import React, { useState } from "react";
import PropTypes from "prop-types";
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   Grid,
   Grow,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { GENERAL_ERROR } from "../../../../util/constants";
import AddIcon from "@mui/icons-material/Add";
import CategoryElement from "../settings/Category/CategoryElement";
import CategoryEdit from "../settings/Category/CategoryEdit";

const ProfileCategories = ({ group, firebase, className, ...rest }) => {
   const { enqueueSnackbar } = useSnackbar();
   const [createMode, setCreateMode] = useState(false);

   const handleSubmitForm = async (values, { setStatus }) => {
      try {
         await firebase.updateCareerCenter(group.id, {
            description: values.description,
            universityName: values.universityName,
         });
         enqueueSnackbar("Your profile has been updated!", {
            variant: "success",
            preventDuplicate: true,
            anchorOrigin: {
               vertical: "top",
               horizontal: "right",
            },
         });
      } catch (e) {
         console.log("error", e);
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         });
         setStatus(e);
      }
   };

   return (
      <Card>
         <Box display="flex" justifyContent="space-between">
            <CardHeader
               subheader="The information can be edited"
               title="Categories"
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
                        category={{}}
                        options={[]}
                        newCategory={true}
                        setEditMode={setCreateMode}
                     />
                  </Grid>
               </Grow>

               {group.categories?.map((category) => {
                  return (
                     <Grid key={category.id} item md={12} xs={12}>
                        <CategoryElement group={group} category={category} />
                     </Grid>
                  );
               })}
            </Grid>
         </CardContent>
         <Divider />
      </Card>
   );
};
ProfileCategories.propTypes = {
   className: PropTypes.string,
   firebase: PropTypes.object,
   group: PropTypes.object,
};

export default ProfileCategories;
