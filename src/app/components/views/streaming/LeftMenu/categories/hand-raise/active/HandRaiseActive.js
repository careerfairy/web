import React, { useContext, useEffect, useState } from "react";
import { withFirebase } from "context/firebase";
import HandRaiseElement from "./hand-raise-element/HandRaiseElement";
import NotificationsContext from "context/notifications/NotificationsContext";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import PanToolOutlinedIcon from "@material-ui/icons/PanToolOutlined";

import {
   Box,
   Button,
   Typography,
   Grow,
   Paper,
   List,
   Collapse,
   Grid,
   InputLabel,
   FormControl,
   Select,
   MenuItem,
} from "@material-ui/core";
import {
   CategoryContainerCentered,
   CategoryContainerTopAligned,
} from "../../../../../../../materialUI/GlobalContainers";
import { ThemedPermanentMarker } from "../../../../../../../materialUI/GlobalTitles";
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext";
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../../materialUI/GlobalTooltips";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";
import useStreamRef from "../../../../../../custom-hook/useStreamRef";
import { TransitionGroup } from "react-transition-group";
import { dynamicSort } from "../../../../../../helperFunctions/HelperFunctions";
import OrderIcon from "@material-ui/icons/KeyboardArrowUpRounded";
import HandRaiseNotifier from "./HandRaiseNotifier";

const useStyles = makeStyles((theme) => ({
   activeHandRaiseContainer: {
      padding: theme.spacing(0, 0, 1),
      height: "100%",
      display: "flex",
      flexDirection: "column",
   },
   filterGrid: {
      padding: theme.spacing(1, 2),
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      margin: 0,
   },
   orderIcon: {
      transition: theme.transitions.create(["transform"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
      transform: ({ up }) => up && `rotate(180deg)`,
   },
   activeHandRaisesWrapper: {
      background: theme.palette.background.default,
   },
}));

const FILTER_MAP = {
   All: () => true,
   Requested: (handRaise) => handRaise.state === "requested",
   Invited: (handRaise) => handRaise.state === "invited",
   Connecting: (handRaise) => handRaise.state === "connecting",
   Connected: (handRaise) => handRaise.state === "connected",
};

function HandRaiseActive({
   firebase,
   livestream,
   showMenu,
   selectedState,
   sliding,
   isGlass,
}) {
   const streamRef = useStreamRef();
   const { closeSnackbar } = useSnackbar();
   const { setNewNotification, setNotificationToRemove } = useContext(
      NotificationsContext
   );
   const {
      tutorialSteps,
      setTutorialSteps,
      getActiveTutorialStepKey,
      isOpen: isStepOpen,
   } = useContext(TutorialContext);
   const [handRaises, setHandRaises] = useState([]);
   const [hasEntered, setHasEntered] = useState(false);
   const [hasExited, setHasExited] = useState(false);
   const [sortByNew, setSortByNew] = useState(true);
   const [filterMapProperty, setFilterMapProperty] = useState("All");
   const [filteredHandRaises, setFilteredHandRaises] = useState([]);
   const classes = useStyles({ up: sortByNew });

   useEffect(() => {
      if (livestream) {
         firebase.listenToActiveHandRaises(streamRef, (querySnapshot) => {
            setHandRaises(
               querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  date: doc.data().timestamp?.toDate?.(),
               }))
            );
         });
      }
   }, [livestream]);

   useEffect(() => {
      handleFilterHandRaises(handRaises, filterMapProperty, sortByNew);
   }, [handRaises, sortByNew, filterMapProperty]);

   const activeStep = getActiveTutorialStepKey();

   const handleFilterHandRaises = (
      arrayOfHandRaises,
      filterMapProperty,
      sortByNew
   ) => {
      const newFilteredHandRaises = arrayOfHandRaises
         .filter((handRaise) => FILTER_MAP[filterMapProperty](handRaise))
         .sort(dynamicSort("date", sortByNew));
      setFilteredHandRaises(newFilteredHandRaises);
   };

   const handleChangeFilterMapProperty = (event) => {
      setFilterMapProperty(event.target.value);
   };

   const handleToggleOrder = () => {
      setSortByNew(!sortByNew);
   };

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            showMenu &&
            tutorialSteps.streamerReady &&
            (tutorialSteps[property] || activeStep === 13) &&
            selectedState === "hand" &&
            !sliding
      );
   };

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      });
   };

   function setHandRaiseModeInactive() {
      firebase.setHandRaiseMode(streamRef, false);
   }

   function updateHandRaiseRequest(handRaiseId, state) {
      firebase.updateHandRaiseRequest(streamRef, handRaiseId, state);
   }

   if (!livestream.handRaiseActive) {
      return null;
   }
   return (
      <>
         <HandRaiseNotifier
           handRaises={handRaises}
           hasEntered={hasEntered}
           updateHandRaiseRequest={updateHandRaiseRequest}
           closeSnackbar={closeSnackbar}
           setNewNotification={setNewNotification}
           numberOfActiveHandRaisers={handRaises.length}
           setNotificationToRemove={setNotificationToRemove}
         />
         <Grow
            timeout={tutorialSteps.streamerReady ? 0 : "auto"}
            onEntered={() => setHasEntered(true)}
            onExited={() => setHasExited(true)}
            mountOnEnter
            unmountOnExit
            in={Boolean(handRaises.length)}
         >
            <Box
               className={classes.activeHandRaisesWrapper}
               display="flex"
               flexDirection="column"
               height="100%"
            >
               <Grid className={classes.filterGrid} container spacing={1}>
                  <Grid xs={8} item>
                     <FormControl size="small" fullWidth>
                        <InputLabel id="hand-raise-filter-select-label">
                           Sort by:
                        </InputLabel>
                        <Select
                           labelId="hand-raise-filter-select-label"
                           id="hand-raise-filter-select"
                           value={filterMapProperty}
                           onChange={handleChangeFilterMapProperty}
                        >
                           {Object.keys(FILTER_MAP).map((key) => (
                              <MenuItem key={key} value={key}>
                                 {key}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  </Grid>
                  <Grid xs={4} item>
                     <Box display="flex" height="100%">
                        <Button
                           size="small"
                           onClick={handleToggleOrder}
                           endIcon={<OrderIcon className={classes.orderIcon} />}
                        >
                           {sortByNew ? "oldest (desc)" : "newest (desc)"}
                        </Button>
                     </Box>
                  </Grid>
               </Grid>
               <List className={classes.activeHandRaiseContainer}>
                  {!Boolean(filteredHandRaises.length) && (
                     <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        p={2}
                     >
                        <Typography>no results</Typography>
                        <Button onClick={() => setFilterMapProperty("All")}>Back to all</Button>
                     </Box>
                  )}
                  <TransitionGroup>
                     {filteredHandRaises.map((handRaise) => (
                        <Collapse key={handRaise.id}>
                           <HandRaiseElement
                              request={handRaise}
                              hasEntered={hasEntered}
                              updateHandRaiseRequest={updateHandRaiseRequest}
                              closeSnackbar={closeSnackbar}
                              setNewNotification={setNewNotification}
                              numberOfActiveHandRaisers={handRaises.length}
                              setNotificationToRemove={setNotificationToRemove}
                           />
                        </Collapse>
                     ))}
                  </TransitionGroup>
                  <Box flexGrow={1} />
                  <Box width="100%" display="grid" placeItems="center" px={2}>
                     <Button
                        style={{ margin: "auto 0 2rem 0" }}
                        startIcon={<CloseRoundedIcon />}
                        variant="contained"
                        children="Deactivate Hand Raise"
                        disabled={isStepOpen(11)}
                        onClick={() => setHandRaiseModeInactive()}
                     />
                  </Box>
               </List>
            </Box>
         </Grow>

         <Grow mountOnEnter unmountOnExit in={Boolean(!handRaises.length)}>
            <CategoryContainerCentered>
               <Box
                  p={2}
                  component={Paper}
                  style={{
                     width: "90%",
                     display: "grid",
                     placeItems: "center",
                  }}
               >
                  <PanToolOutlinedIcon
                     color="primary"
                     style={{ fontSize: 40 }}
                  />
                  <ThemedPermanentMarker gutterBottom>
                     Waiting for viewers to raise their hands...
                  </ThemedPermanentMarker>
                  <Typography style={{ marginBottom: "1rem" }} align="center">
                     Your viewers can now request to join the stream. Don't
                     forget to remind them to join in!
                  </Typography>
                  <Typography
                     style={{
                        marginBottom: "0.8rem",
                        textTransform: "uppercase",
                     }}
                     align="center"
                  >
                     You can invite up to 8 hand raisers
                  </Typography>
                  <WhiteTooltip
                     placement="right-end"
                     title={
                        <React.Fragment>
                           <TooltipTitle>Hand Raise (5/5)</TooltipTitle>
                           <TooltipText>
                              You can de-activate the Hand Raise mode to prevent
                              viewers from making subsequent requests.
                           </TooltipText>
                           {activeStep === 13 && (
                              <TooltipButtonComponent
                                 onConfirm={() => {
                                    setHandRaiseModeInactive();
                                    handleConfirm(13);
                                 }}
                                 buttonText="Ok"
                              />
                           )}
                        </React.Fragment>
                     }
                     open={hasExited && isOpen(13)}
                  >
                     <Button
                        variant="contained"
                        startIcon={<CloseRoundedIcon />}
                        children="Deactivate Hand Raise"
                        onClick={() => {
                           setHandRaiseModeInactive();
                           isOpen(13) && activeStep === 13 && handleConfirm(13);
                        }}
                     />
                  </WhiteTooltip>
               </Box>
            </CategoryContainerCentered>
         </Grow>
      </>
   );
}

export default withFirebase(HandRaiseActive);
