import React, { useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import {
   Box,
   Button,
   Collapse,
   Drawer,
   Grid,
   IconButton,
   List,
} from "@material-ui/core";
import { ThemedPermanentMarker } from "../../../../materialUI/GlobalTitles";
import CloseIcon from "@material-ui/icons/Close";
import { useCurrentStream } from "context/stream/StreamContext";
import { useFirebase } from "context/firebase";
import useStreamRef from "components/custom-hook/useStreamRef";
import { getCtaSnackBarProps } from "components/util/constants/callToActions";
import CallToActionSnackbar from "components/views/streaming/sharedComponents/StreamNotifications/CallToActionSnackbar";
import { TransitionGroup } from "react-transition-group";
import { useAuth } from "HOCs/AuthProvider";

const useStyles = makeStyles((theme) => ({
   glass: {
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
   },
   title: {
      textAlign: "left",
      fontSize: theme.typography.h2.fontSize,
      width: "auto",
   },
   modalButton: {
      color: theme.palette.common.white,
   },
   breakoutRoomItem: {
      boxShadow: theme.shadows[2],
      borderRadius: theme.shape.borderRadius,
      margin: theme.spacing(1, 0),
      background: theme.palette.background.paper,
      "&:hover": {
         background: theme.palette.background.default,
         color: theme.palette.primary.main,
      },
      textDecoration: "none !important",
   },
}));

const Content = ({ fullyOpened, handleClose, mobile }) => {
   const { currentLivestream } = useCurrentStream();

   const [callToActions, setCallToActions] = useState([]);
   const [loading, setLoading] = useState(false);
   const streamRef = useStreamRef();

   const dispatch = useDispatch();

   const { userData, authenticatedUser } = useAuth();

   const {
      getCallToActionsWithAnArrayOfIds,
      clickOnCallToAction,
   } = useFirebase();

   const classes = useStyles();

   useEffect(() => {
      return () => dispatch(actions.closeViewerCtaModal());
   }, []);

   useEffect(() => {
      (async function getAndSetCallToActions() {
         const newCallToActions = await getCallToActionsWithAnArrayOfIds(
            streamRef,
            currentLivestream?.activeCallToActionIds
         );

         setCallToActions(newCallToActions);
         if (!newCallToActions.length) {
            dispatch(actions.closeViewerCtaModal());
         }
      })();
   }, [currentLivestream?.activeCallToActionIds]);

   const closeProps = () => ({
      className: classes.modalButton,
      onClick: handleClose,
   });

   const handleClickCallToAction = async (callToActionId, buttonUrl) => {
      setLoading(true);
      try {
         await clickOnCallToAction(streamRef, callToActionId, userData?.id);
         if (window) {
            window.open(buttonUrl, "_blank");
            // .focus() DOnt know if we should focus the new tab automatically
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      dispatch(actions.closeSnackbar(callToActionId));
      setLoading(false);
   };

   return (
      <div>
         <Box
            paddingY={1}
            paddingX={2}
            alignItems="center"
            justifyContent="space-between"
            display="flex"
         >
            <ThemedPermanentMarker className={classes.title}>
               Live Messages{" "}
               {currentLivestream?.company
                  ? `From ${currentLivestream?.company}`
                  : null}
            </ThemedPermanentMarker>
            <Box flex={1} />
            {mobile ? (
               <IconButton {...closeProps()}>
                  <CloseIcon />
               </IconButton>
            ) : (
               <Button {...closeProps()}>Close</Button>
            )}
         </Box>
         <Box p={1}>
            <List>
               <Grid component={TransitionGroup} spacing={2} container>
                  {callToActions.map((callToAction) => {
                     const ctaSnackProps = getCtaSnackBarProps(
                        callToAction,
                        currentLivestream.backgroundImageUrl
                     );
                     return (
                        <Grid
                           key={ctaSnackProps.id}
                           component={Collapse}
                           item
                           xs={12}
                        >
                           <CallToActionSnackbar
                              onClick={() =>
                                 handleClickCallToAction(
                                    ctaSnackProps.id,
                                    ctaSnackProps.buttonUrl
                                 )
                              }
                              loading={loading}
                              authenticatedUser={authenticatedUser}
                              currentLivestream={currentLivestream}
                              hideClose
                              {...ctaSnackProps}
                           />
                        </Grid>
                     );
                  })}
               </Grid>
            </List>
         </Box>
      </div>
   );
};

const ViewerCtaModal = ({ mobile }) => {
   const open = useSelector((state) => state.stream.layout.viewerCtaModalOpen);
   const dispatch = useDispatch();
   const classes = useStyles();
   const [fullyOpened, setFullyOpened] = useState(false);

   const handleClose = () => {
      dispatch(actions.closeViewerCtaModal());
   };

   const handleEntered = () => {
      setFullyOpened(true);
   };

   return (
      <Drawer
         anchor="top"
         open={open}
         PaperProps={{
            className: classes.glass,
         }}
         SlideProps={{
            onEntered: handleEntered,
         }}
         onClose={handleClose}
      >
         <Content
            fullyOpened={fullyOpened}
            mobile={mobile}
            handleClose={handleClose}
         />
      </Drawer>
   );
};

export default ViewerCtaModal;
