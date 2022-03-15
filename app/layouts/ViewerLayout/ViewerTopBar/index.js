import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import {
   AppBar,
   Badge,
   Box,
   Button,
   Checkbox,
   IconButton,
   Toolbar,
   Tooltip,
} from "@mui/material"
import { MainLogo } from "../../../components/logos"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import CallToActionIcon from "@mui/icons-material/Link"
import PropTypes from "prop-types"
import Logo from "./Logo"
import { useThemeToggle } from "../../../context/theme/ThemeContext"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import PeopleIcon from "@mui/icons-material/People"
import NewFeatureHint from "../../../components/util/NewFeatureHint"
import ViewerBreakoutRoomModal from "./ViewerBreakoutRoomModal"
import BackToMainRoomIcon from "@mui/icons-material/ArrowBackIos"
import { useRouter } from "next/router"
import useStreamToken from "../../../components/custom-hook/useStreamToken"
import BreakoutRoomIcon from "@mui/icons-material/Widgets"
import { useDispatch, useSelector } from "react-redux"
import breakoutRoomsSelector from "../../../components/selectors/breakoutRoomsSelector"
import * as actions from "store/actions"
import useStreamGroups from "../../../components/custom-hook/useStreamGroups"
import ViewerCtaModal from "./ViewerCtaModal"
import FocusModeButton from "./buttons/FocusModeButton"
import JoinTalentPoolButton from "./buttons/JoinTalentPoolButton"
import { localStorageAudienceDrawerKey } from "constants/localStorageKeys"

const useStyles = makeStyles((theme) => ({
   toolbar: {
      minHeight: 55,
      display: "flex",
      justifyContent: "space-between",
      "& .MuiIconButton-root": {
         width: 40,
         height: 40,
      },
   },
   viewCount: {
      color: theme.palette.primary.main,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: theme.spacing(0, 1),
   },
   floatingWrapper: {
      position: "absolute",
      top: theme.spacing(2.5),
      right: theme.spacing(2.5),
      zIndex: 120,
      display: "flex",
      alignItems: "center",
      "& svg": {
         filter: `drop-shadow(0px 0px 3px rgba(0,0,0,0.4))`,
      },
      "& .MuiIconButton-root": {
         color: theme.palette.primary.main,
         width: 35,
         height: 35,
      },
   },
}))

const ViewerTopBar = ({
   mobile,
   showAudience,
   showMenu,
   audienceDrawerOpen,
}) => {
   const classes = useStyles()
   const [ctaStatus, setCtaStatus] = useState({
      active: false,
      numberActive: 0,
   })
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter()
   const dispatch = useDispatch()
   const { toggleTheme, themeMode } = useThemeToggle()
   const links = useStreamToken({ forStreamType: "mainLivestream" })
   const theme = useTheme()
   const { currentLivestream } = useCurrentStream()
   const numberOfViewers = useSelector((state) =>
      currentLivestream?.hasStarted ? state.stream.stats.numberOfViewers : 0
   )

   const breakoutRoomOpen = useSelector((state) =>
      Boolean(
         breakoutRoomsSelector(
            state.firestore.ordered[`Active BreakoutRooms of ${livestreamId}`]
         )?.length
      )
   )
   const focusModeEnabled = useSelector(
      (state) => state.stream.layout.focusModeEnabled
   )

   const careerCenters = useStreamGroups(currentLivestream?.groupIds)

   useEffect(() => {
      const numberActive = currentLivestream?.activeCallToActionIds?.length || 0
      setCtaStatus({
         active: Boolean(numberActive),
         numberActive: numberActive,
      })
   }, [currentLivestream.activeCallToActionIds])

   const handleBackToMainRoom = () => {
      window.location.href = links.viewerLink
   }

   const handleOpenBreakoutRoomModal = () => {
      dispatch(actions.openViewerBreakoutModal())
   }
   const handleOpenCtaModal = () => {
      setCtaStatus({ ...ctaStatus, numberActive: 0 })
      dispatch(actions.openViewerCtaModal())
   }

   if (focusModeEnabled || (mobile && !showMenu)) {
      return (
         <React.Fragment>
            <div className={classes.floatingWrapper}>
               <FocusModeButton
                  audienceDrawerOpen={audienceDrawerOpen}
                  mobile={mobile}
                  primary
               />
               {breakoutRoomId && (
                  <Tooltip title="Back to main room">
                     <Button
                        onClick={handleBackToMainRoom}
                        style={{ marginRight: 5 }}
                        startIcon={<BackToMainRoomIcon />}
                        color="secondary"
                        variant="outlined"
                     >
                        Back
                     </Button>
                  </Tooltip>
               )}

               {breakoutRoomOpen && (
                  <Tooltip title="Checkout breakout rooms">
                     <IconButton
                        onClick={handleOpenBreakoutRoomModal}
                        size="large"
                     >
                        <Badge color="secondary" badgeContent={"!"}>
                           <BreakoutRoomIcon />
                        </Badge>
                     </IconButton>
                  </Tooltip>
               )}
               {ctaStatus.active && (
                  <Tooltip
                     title={`Checkout live messages${
                        currentLivestream?.company
                           ? ` from ${currentLivestream?.company}`
                           : ""
                     }`}
                  >
                     <IconButton onClick={handleOpenCtaModal} size="large">
                        <Badge
                           color="secondary"
                           badgeContent={ctaStatus.numberActive && "!"}
                        >
                           <CallToActionIcon />
                        </Badge>
                     </IconButton>
                  </Tooltip>
               )}
               <NewFeatureHint
                  onClickConfirm={showAudience}
                  tooltipText="Click here to see who's joined the stream since the start"
                  localStorageKey={localStorageAudienceDrawerKey}
                  tooltipTitle="Hint"
               >
                  <Tooltip title="See who joined">
                     <IconButton
                        onClick={showAudience}
                        className={classes.floatingButton}
                        size="large"
                     >
                        <Badge
                           max={999999}
                           color="secondary"
                           badgeContent={numberOfViewers}
                        >
                           <PeopleIcon />
                        </Badge>
                     </IconButton>
                  </Tooltip>
               </NewFeatureHint>
               <JoinTalentPoolButton mobile />
            </div>
            <ViewerBreakoutRoomModal
               mobile={mobile}
               localStorageAudienceDrawerKey={localStorageAudienceDrawerKey}
               handleBackToMainRoom={handleBackToMainRoom}
            />
            <ViewerCtaModal mobile={mobile} />
         </React.Fragment>
      )
   }

   if (mobile && showMenu) {
      return null
   }

   const logoElements = careerCenters
      .map((cc) => {
         return <Logo key={cc.groupId} src={cc.logoUrl} />
      })
      .filter((cc) => cc.logoUrl || cc.groupId)

   return (
      <React.Fragment>
         <AppBar elevation={1} color="transparent">
            <Toolbar className={classes.toolbar}>
               <MainLogo white={theme.palette.mode === "dark"} />
               {logoElements}
               <Box flexGrow={1} />
               {currentLivestream.companyLogoUrl && (
                  <Logo src={currentLivestream.companyLogoUrl} />
               )}
               <Box display="flex" alignItems="center">
                  {breakoutRoomId && (
                     <Tooltip title="Back to main room">
                        <Button
                           onClick={handleBackToMainRoom}
                           startIcon={<BackToMainRoomIcon />}
                           color="secondary"
                           variant="contained"
                        >
                           Back
                        </Button>
                     </Tooltip>
                  )}
                  {breakoutRoomOpen && (
                     <Tooltip title="Checkout breakout rooms">
                        <IconButton
                           onClick={handleOpenBreakoutRoomModal}
                           size="large"
                        >
                           <Badge color="secondary" badgeContent={"!"}>
                              <BreakoutRoomIcon />
                           </Badge>
                        </IconButton>
                     </Tooltip>
                  )}
                  {ctaStatus.active && (
                     <Tooltip
                        title={`Checkout live messages${
                           currentLivestream?.company
                              ? ` from ${currentLivestream?.company}`
                              : ""
                        }`}
                     >
                        <IconButton onClick={handleOpenCtaModal} size="large">
                           <Badge
                              color="secondary"
                              badgeContent={ctaStatus.numberActive && "!"}
                           >
                              <CallToActionIcon />
                           </Badge>
                        </IconButton>
                     </Tooltip>
                  )}
                  <FocusModeButton audienceDrawerOpen={audienceDrawerOpen} />
                  <Tooltip
                     title={
                        themeMode === "dark"
                           ? "Switch to light theme"
                           : "Switch to dark mode"
                     }
                  >
                     <Checkbox
                        checked={themeMode === "dark"}
                        onChange={toggleTheme}
                        icon={<Brightness4Icon />}
                        checkedIcon={<Brightness7Icon />}
                        color="default"
                     />
                  </Tooltip>
                  <NewFeatureHint
                     onClickConfirm={showAudience}
                     tooltipText="Click here to see who's joined the stream since the start"
                     localStorageKey={localStorageAudienceDrawerKey}
                     tooltipTitle="Hint"
                  >
                     <Box className={classes.viewCount}>
                        <Tooltip title="See who joined">
                           <Button
                              color="primary"
                              size="large"
                              startIcon={
                                 <Badge
                                    max={999999}
                                    color="secondary"
                                    badgeContent={numberOfViewers}
                                 >
                                    <PeopleIcon />
                                 </Badge>
                              }
                              onClick={showAudience}
                           >
                              See who joined
                           </Button>
                        </Tooltip>
                     </Box>
                  </NewFeatureHint>
               </Box>
               <JoinTalentPoolButton mobile={mobile} />
            </Toolbar>
         </AppBar>
         <ViewerBreakoutRoomModal
            localStorageAudienceDrawerKey={localStorageAudienceDrawerKey}
            handleBackToMainRoom={handleBackToMainRoom}
         />
         <ViewerCtaModal mobile={mobile} />
      </React.Fragment>
   )
}

ViewerTopBar.propTypes = {
   mobile: PropTypes.bool.isRequired,
   showAudience: PropTypes.func.isRequired,
   showMenu: PropTypes.bool.isRequired,
   selectedState: PropTypes.string,
}

export default ViewerTopBar
