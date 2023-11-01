import React, { useContext, useEffect, useState } from "react"
import HandRaiseElement from "./hand-raise-element/HandRaiseElement"
import NotificationsContext from "context/notifications/NotificationsContext"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined"

import {
   Box,
   Button,
   Collapse,
   FormControl,
   Grid,
   Grow,
   InputLabel,
   List,
   MenuItem,
   Paper,
   Select,
   Typography,
} from "@mui/material"
import { CategoryContainerCentered } from "../../../../../../../materialUI/GlobalContainers"
import { ThemedPermanentMarker } from "../../../../../../../materialUI/GlobalTitles"
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext"
import {
   TooltipButtonComponent,
   TooltipText,
   TooltipTitle,
   WhiteTooltip,
} from "../../../../../../../materialUI/GlobalTooltips"
import makeStyles from "@mui/styles/makeStyles"
import { TransitionGroup } from "react-transition-group"
import { dynamicSort } from "../../../../../../helperFunctions/HelperFunctions"
import OrderIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import useStreamActiveHandRaises from "../../../../../../custom-hook/useStreamActiveHandRaises"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"

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
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
      transform: ({ up }) => up && `rotate(180deg)`,
   },
   activeHandRaisesWrapper: {
      background: theme.palette.background.default,
   },
}))

const FILTER_MAP = {
   All: () => true,
   Requested: (handRaise) => handRaise.state === "requested",
   Invited: (handRaise) => handRaise.state === "invited",
   Connecting: (handRaise) => handRaise.state === "connecting",
   Connected: (handRaise) => handRaise.state === "connected",
}

function HandRaiseActive({ livestream, showMenu, selectedState, sliding }) {
   const dispatch = useDispatch()

   const closeSnackbar = (...args) => dispatch(actions.closeSnackbar(...args))

   const { setNewNotification, setNotificationToRemove } =
      useContext(NotificationsContext)
   const {
      tutorialSteps,
      setTutorialSteps,
      getActiveTutorialStepKey,
      isOpen: isStepOpen,
   } = useContext(TutorialContext)
   const {
      handRaises,
      handlers,
      numberOfActiveHandRaisers,
      hasRoom,
      maxHandRaisers,
   } = useStreamActiveHandRaises()
   const [hasEntered, setHasEntered] = useState(false)
   const [hasExited, setHasExited] = useState(false)
   const [sortByNew, setSortByNew] = useState(true)
   const [filterMapProperty, setFilterMapProperty] = useState("All")
   const [filteredHandRaises, setFilteredHandRaises] = useState([])

   const classes = useStyles({ up: sortByNew })

   useEffect(() => {
      handleFilterHandRaises(handRaises, filterMapProperty, sortByNew)
   }, [handRaises, sortByNew, filterMapProperty])

   const activeStep = getActiveTutorialStepKey()

   const handleFilterHandRaises = (
      arrayOfHandRaises,
      filterMapProperty,
      sortByNew
   ) => {
      if (!arrayOfHandRaises) return
      const newFilteredHandRaises = arrayOfHandRaises
         .filter((handRaise) => FILTER_MAP[filterMapProperty](handRaise))
         .map((handRaise) => ({
            ...handRaise,
            date: handRaise.timestamp?.toDate() || new Date(),
         }))
         .sort(dynamicSort("date", sortByNew))
      setFilteredHandRaises(newFilteredHandRaises)
   }

   const handleChangeFilterMapProperty = (event) => {
      setFilterMapProperty(event.target.value)
   }

   const handleToggleOrder = () => {
      setSortByNew(!sortByNew)
   }

   const isOpen = (property) => {
      return Boolean(
         livestream.test &&
            showMenu &&
            tutorialSteps.streamerReady &&
            (tutorialSteps[property] || activeStep === 13) &&
            selectedState === "hand" &&
            !sliding
      )
   }

   const handleConfirm = (property) => {
      setTutorialSteps({
         ...tutorialSteps,
         [property]: false,
         [property + 1]: true,
      })
   }

   if (!livestream.handRaiseActive) {
      return null
   }
   return (
      <>
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
                           label="Sort by:"
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
                        <Button onClick={() => setFilterMapProperty("All")}>
                           Back to all
                        </Button>
                     </Box>
                  )}
                  <TransitionGroup>
                     {filteredHandRaises.map((handRaise) => (
                        <Collapse key={handRaise.id}>
                           <HandRaiseElement
                              request={handRaise}
                              hasEntered={hasEntered}
                              updateHandRaiseRequest={handlers.updateRequest}
                              closeSnackbar={closeSnackbar}
                              hasRoom={hasRoom}
                              maxHandRaisers={maxHandRaisers}
                              setNewNotification={setNewNotification}
                              numberOfActiveHandRaisers={
                                 numberOfActiveHandRaisers
                              }
                              setNotificationToRemove={setNotificationToRemove}
                           />
                        </Collapse>
                     ))}
                  </TransitionGroup>
                  <Box flexGrow={1} />
                  <Box width="100%" display="grid" px={2}>
                     <Button
                        style={{ margin: "auto 0 2rem 0" }}
                        startIcon={<CloseRoundedIcon />}
                        variant="contained"
                        disabled={isStepOpen(11)}
                        onClick={handlers.setHandRaiseModeInactive}
                     >
                        Deactivate Hand Raise
                     </Button>
                  </Box>
               </List>
            </Box>
         </Grow>

         <Grow mountOnEnter unmountOnExit in={Boolean(!handRaises.length)}>
            <span>
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
                     <Typography
                        style={{ marginBottom: "1rem" }}
                        align="center"
                     >
                        Your viewers can now request to join the stream.
                        Don&apos;t forget to remind them to join in!
                     </Typography>
                     <Typography
                        style={{
                           marginBottom: "0.8rem",
                           textTransform: "uppercase",
                        }}
                        align="center"
                     >
                        You can invite up to {maxHandRaisers} hand raisers
                     </Typography>
                     <WhiteTooltip
                        placement="right-end"
                        title={
                           <React.Fragment>
                              <TooltipTitle>Hand Raise (5/5)</TooltipTitle>
                              <TooltipText>
                                 You can de-activate the Hand Raise mode to
                                 prevent viewers from making subsequent
                                 requests.
                              </TooltipText>
                              {activeStep === 13 && (
                                 <TooltipButtonComponent
                                    onConfirm={() => {
                                       handlers.setHandRaiseModeInactive()
                                       handleConfirm(13)
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
                           onClick={() => {
                              handlers.setHandRaiseModeInactive()
                              isOpen(13) &&
                                 activeStep === 13 &&
                                 handleConfirm(13)
                           }}
                        >
                           Deactivate Hand Raise
                        </Button>
                     </WhiteTooltip>
                  </Box>
               </CategoryContainerCentered>
            </span>
         </Grow>
      </>
   )
}

export default HandRaiseActive
