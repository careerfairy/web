import React, { useState } from "react";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EditIcon from "@mui/icons-material/Edit";
import {
   Button,
   Card,
   CardActions,
   CardContent,
   CardMedia,
   Grid,
   Tooltip,
   Typography,
} from "@mui/material";
import GroupJoinModal from "./GroupJoinModal";
import Fade from "@stahl.luke/react-reveal/Fade";
import { getMaxLineStyles } from "../../helperFunctions/HelperFunctions";

const styles = {
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: "90px",
      "& img": {
         objectFit: "contain",
         maxWidth: "80%",
      },
   },
   groupName: {
      fontSize: "1.1rem",
      ...getMaxLineStyles(2),
   },
   groupDesc: {
      ...getMaxLineStyles(2),
   },
};

const NewGroup = ({ group, userData, makeSix, selected }) => {
   const [openJoinModal, setOpenJoinModal] = useState(false);

   const handleCloseJoinModal = () => {
      setOpenJoinModal(false);
   };
   const handleOpenJoinModal = () => {
      setOpenJoinModal(true);
   };

   return (
      <Grid
         key={group.id}
         item
         xs={12}
         sm={selected || 6}
         md={selected && makeSix ? 12 : selected ? 6 : makeSix || 4}
         lg={selected && makeSix ? 12 : selected ? 6 : makeSix || 4}
      >
         <Fade ssrFadeout bottom duration={600}>
            <Card>
               <CardMedia sx={styles.media}>
                  <img src={group.logoUrl} style={{}} alt="" />
               </CardMedia>
               <CardContent style={{ height: "115px" }}>
                  <Tooltip title={group.universityName} enterDelay={1000}>
                     <Typography
                        sx={styles.groupName}
                        align="center"
                        gutterBottom
                     >
                        {group.universityName}
                     </Typography>
                  </Tooltip>
                  <Tooltip title={group.description} enterDelay={1000}>
                     <Typography
                        variant="body2"
                        sx={styles.groupDesc}
                        align="center"
                        color="textSecondary"
                        component="p"
                     >
                        {group.description}
                     </Typography>
                  </Tooltip>
               </CardContent>
               <CardActions>
                  {userData.groupIds?.includes(group.id) ? (
                     <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={handleOpenJoinModal}
                        endIcon={<EditIcon size={20} color="inherit" />}
                     >
                        Update
                     </Button>
                  ) : (
                     <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={handleOpenJoinModal}
                        endIcon={<GroupAddIcon size={20} color="inherit" />}
                     >
                        Follow
                     </Button>
                  )}
               </CardActions>
               <GroupJoinModal
                  open={openJoinModal}
                  group={group}
                  alreadyJoined={userData.groupIds?.includes(group.id)}
                  userData={userData}
                  closeModal={handleCloseJoinModal}
               />
            </Card>
         </Fade>
      </Grid>
   );
};

export default NewGroup;
