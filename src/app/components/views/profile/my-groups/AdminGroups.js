import React, { Fragment, useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { withFirebase } from "context/firebase";
import CurrentGroup from "components/views/profile/CurrentGroup";
import makeStyles from '@mui/styles/makeStyles';
import { Highlights } from "../../groups/Groups";
import useInfiniteScrollClientWithHandlers from "../../../custom-hook/useInfiniteScrollClientWithHandlers";

const useStyles = makeStyles((theme) => ({
   header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
      flexWrap: "wrap",
   },
   title: {
      color: "rgb(160,160,160)",
      margin: "0 0 10px 0",
      fontWeight: "300",
   },
}));

const AdminGroups = ({ userData, adminGroups }) => {
   const classes = useStyles();
   const [selectedGroup, setSelectedGroup] = useState(null);
   const [filteredAdminGroups, setFilteredAdminGroups] = useState([]);
   const [slicedFilteredAdminGroups] = useInfiniteScrollClientWithHandlers(
      filteredAdminGroups,
      9,
      6
   );

   let adminGroupElements = [];

   useEffect(() => {
      if (selectedGroup) {
         setFilteredAdminGroups(
            adminGroups.filter((group) => group.id === selectedGroup.id)
         );
      } else {
         setFilteredAdminGroups([...adminGroups]);
      }
   }, [selectedGroup, adminGroups]);
   const handleSelectGroup = (event, value) => {
      setSelectedGroup(value);
   };

   if (userData) {
      adminGroupElements = slicedFilteredAdminGroups.map((group) => {
         return (
            <Fragment key={group.id}>
               <CurrentGroup isAdmin={true} group={group} userData={userData} />
            </Fragment>
         );
      });
   }

   return (
      <Fragment>
         <div>
            <div className={classes.header}>
               <Typography className={classes.title} variant="h5">
                  Admin Groups
               </Typography>
            </div>
            {adminGroupElements.length ? (
               <>
                  <Box>
                     <Highlights
                        handleSelectGroup={handleSelectGroup}
                        hideButton
                        groups={adminGroups}
                     />
                  </Box>
                  <Grid style={{ marginBottom: 50 }} container spacing={3}>
                     {adminGroupElements}
                  </Grid>
               </>
            ) : (
               <Typography gutterBottom>
                  You are currently not an admin of any career group.
               </Typography>
            )}
         </div>
      </Fragment>
   );
};

export default withFirebase(AdminGroups);
