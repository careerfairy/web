import PropTypes from "prop-types";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { languageCodes } from "../../../../../helperFunctions/streamFormFunctions";
import {
   CardHeader,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   CardActions,
   CardContent,
   CardMedia,
   Button,
   Card,
   Avatar,
   IconButton,
   Menu,
   MenuItem,
} from "@material-ui/core";
import {
   getBaseUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
import RegistrationsIcon from "@material-ui/icons/People";
import ParticipationIcon from "@material-ui/icons/Visibility";
import JoinIcon from "@material-ui/icons/RecordVoiceOver";
import { useFirestore } from "react-redux-firebase";
import { useDispatch } from "react-redux";
import * as actions from "../../../../../../store/actions/index";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import StreamerLinksDialog from "../../../../group/admin/events/enhanced-group-stream-card/StreamerLinksDialog";
import { streamType } from "../../../../../../types";

const useStyles = makeStyles((theme) => ({
   root: {
      // maxWidth: 345,
   },
   media: {
      objectFit: "contain",
      padding: theme.spacing(1),
   },
   list: {
      width: "100%",
   },
   spyButton: {
      color: `${theme.palette.common.white} !important`,
   },
   cardHeader: {
      "& .MuiCardHeader-content": {
         flex: "1 1 auto",
         width: "calc(100% - 30px)",
      },
   },
}));

const StreamCard = ({ stream }) => {
   const classes = useStyles();
   const firestore = useFirestore();
   const dispatch = useDispatch();

   const [anchorEl, setAnchorEl] = React.useState(null);
   const [openStreamerLinksDialog, setOpenStreamerLinksDialog] = React.useState(
      false
   );

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleJoinAsStreamer = async () => {
      try {
         const tokenDoc = await firestore.get({
            collection: "livestreams",
            doc: stream.id,
            subcollections: [
               {
                  collection: "tokens",
                  doc: "secureToken",
               },
            ],
         });
         if (tokenDoc.exists) {
            const secureToken = tokenDoc.data().value;
            const baseUrl = getBaseUrl();
            const url = `${baseUrl}/streaming/${stream.id}/joining-streamer?token=${secureToken}`;
            const newWindow = window.open(url, "_blank");
            newWindow.focus();
         } else {
            dispatch(actions.sendGeneralError("This stream has no token"));
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
   };

   return (
      <Card className={classes.root}>
         <CardMedia
            component="img"
            alt="Contemplative Reptile"
            height="140"
            className={classes.media}
            image={stream.companyLogoUrl}
            title={stream.company}
         />
         <CardHeader
            className={classes.cardHeader}
            title={stream.company}
            titleTypographyProps={{ noWrap: true }}
            subheader={prettyDate(stream.start)}
            action={
               <React.Fragment>
                  <IconButton onClick={handleClick}>
                     <MoreVertIcon />
                  </IconButton>
                  {
                     <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                     >
                        <MenuItem
                           component="a"
                           target="_blank"
                           onClick={handleClose}
                           href={`https://console.firebase.google.com/u/0/project/careerfairy-e1fd9/firestore/data/~2Flivestreams~2F${stream.id}`}
                        >
                           View in firebase
                        </MenuItem>
                        <MenuItem
                           onClick={() => setOpenStreamerLinksDialog(true)}
                        >
                           Get streamer links
                        </MenuItem>
                     </Menu>
                  }
               </React.Fragment>
            }
         />
         <CardContent>
            <List dense className={classes.list}>
               <ListItem>
                  <ListItemAvatar>
                     <Avatar>
                        <RegistrationsIcon />
                     </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                     primary="Registrations"
                     secondary={stream.registeredUsers?.length || 0}
                  />
               </ListItem>
               <ListItem>
                  <ListItemAvatar>
                     <Avatar>
                        <ParticipationIcon />
                     </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                     primary="Participating"
                     secondary={stream.participatingStudents?.length || 0}
                  />
               </ListItem>
            </List>
         </CardContent>
         <CardActions>
            <Button
               variant="contained"
               className={classes.spyButton}
               target="_blank"
               startIcon={<ParticipationIcon />}
               href={`https://testing2-careerfairy.web.app/streaming/${stream.id}/viewer`}
               color="primary"
            >
               Spy
            </Button>
            <Button
               startIcon={<JoinIcon />}
               variant="contained"
               onClick={handleJoinAsStreamer}
               color="secondary"
            >
               Join as streamer
            </Button>
         </CardActions>
         <StreamerLinksDialog
            onClose={handleClose}
            livestreamId={stream.id}
            openDialog={openStreamerLinksDialog}
            setOpenDialog={setOpenStreamerLinksDialog}
         />
      </Card>
   );
};

StreamCard.propTypes = {
   stream: streamType.isRequired,
};

export default StreamCard;
