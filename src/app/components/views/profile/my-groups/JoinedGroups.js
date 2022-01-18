import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useFirebase, withFirebase } from "context/firebase";
import AddIcon from "@mui/icons-material/Add";
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
      color: theme.palette.text.secondary,
      margin: "0 0 10px 0",
      fontWeight: "300",
   },
}));

const JoinedGroups = ({ userData }) => {
   const router = useRouter();
   const classes = useStyles();
   const [joinedGroups, setJoinedGroups] = useState([]);
   const [selectedGroup, setSelectedGroup] = useState(null);
   const [filteredGroups, setFilteredGroups] = useState([]);
   const [slicedFilteredGroups] = useInfiniteScrollClientWithHandlers(
      filteredGroups,
      9,
      6
   );
   const { getFollowingGroups } = useFirebase();

   useEffect(() => {
      (async function () {
         if (userData?.groupIds?.length) {
            const newJoinedGroups = await getFollowingGroups(userData.groupIds);
            setJoinedGroups(newJoinedGroups);
         } else {
            setJoinedGroups([]);
         }
      })();
   }, [userData.groupIds]);

   useEffect(() => {
      if (selectedGroup) {
         setFilteredGroups(
            joinedGroups.filter((group) => group.id === selectedGroup.id)
         );
      } else {
         setFilteredGroups([...joinedGroups]);
      }
   }, [joinedGroups, selectedGroup]);

   const existingGroupElements = slicedFilteredGroups.map((group) => (
      <CurrentGroup key={group.id} group={group} userData={userData} />
   ));

   const handleSelectGroup = (event, value) => {
      setSelectedGroup(value);
   };

   return (
      <div>
         <div className={classes.header}>
            <Typography className={classes.title} variant="h5">
               My Groups
            </Typography>
            <Button
               endIcon={<AddIcon />}
               variant="contained"
               style={{ position: "sticky" }}
               color="primary"
               onClick={() => router.push("/groups")}
            >
               Follow More Groups
            </Button>
         </div>
         <Box>
            <Highlights
               handleSelectGroup={handleSelectGroup}
               hideButton
               groups={joinedGroups}
            />
         </Box>
         {existingGroupElements.length ? (
            <Grid style={{ marginBottom: 50 }} container spacing={3}>
               {existingGroupElements}
            </Grid>
         ) : (
            <Typography gutterBottom>
               You are currently not a member of any career group.
            </Typography>
         )}
      </div>
   );
};

export default withFirebase(JoinedGroups);
