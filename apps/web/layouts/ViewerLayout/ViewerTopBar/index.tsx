import React, { useCallback, useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
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
import { useAuth } from "../../../HOCs/AuthProvider"
import BadgeButton from "../../../components/views/common/BadgeButton"
import { StylesProps } from "../../../types/commonTypes"
import { Badge as BadgeType } from "@careerfairy/shared-lib/dist/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { focusModeEnabledSelector } from "../../../store/selectors/streamSelectors"
import { useNumberOfViewers } from "context/stream/useNumberOfViewers"

const styles: StylesProps = {
   appBar: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: (theme) => theme.palette.background.paper,
   },
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
      color: "primary.main",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: (theme) => theme.spacing(0, 1),
   },
   floatingWrapper: {
      position: "absolute",
      top: 11.5,
      right: 2.5,
      zIndex: 120,
      display: "flex",
      alignItems: "center",
      "& svg": {
         filter: `drop-shadow(0px 0px 3px rgba(0,0,0,0.4))`,
      },
      "& .MuiIconButton-root": {
         color: "primary.main",
         width: 35,
         height: 35,
      },
   },
}

const ViewerTopBar = ({
   mobile,
   showAudience,
   showMenu,
   audienceDrawerOpen,
}) => {
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

   const numberOfViewers = useNumberOfViewers(currentLivestream)

   const breakoutRoomOpen = useSelector((state: any) =>
      Boolean(
         breakoutRoomsSelector(
            state.firestore.ordered[`Active BreakoutRooms of ${livestreamId}`]
            // @ts-ignore
         )?.length
      )
   )
   const focusModeEnabled = useSelector(focusModeEnabledSelector)

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
            <Box sx={styles.floatingWrapper}>
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
                  hide={false}
               >
                  <Tooltip title="See who joined">
                     <IconButton onClick={showAudience} size="large">
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
            </Box>
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
      .filter((cc) => cc.logoUrl || cc.groupId)
      .map((cc) => {
         return <Logo key={cc.groupId} src={cc.logoUrl} />
      })

   return (
      <React.Fragment>
         <AppBar sx={styles.appBar} elevation={1}>
            <Toolbar sx={styles.toolbar}>
               <MainLogo white={theme.palette.mode === "dark"} />
               {logoElements}

               <Box ml={logoElements.length > 0 ? 0 : 1}>
                  <UserBadge />
               </Box>

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
                     hide={false}
                  >
                     <Box sx={styles.viewCount}>
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
            mobile={false}
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

const UserBadge = () => {
   const { userPresenter } = useAuth()

   const tooltipText = useCallback(
      (badge: BadgeType) =>
         `You earned the ${badge.name} Level ${badge.level} badge! Your questions during this event will be highlighted!`,
      []
   )

   if (!userPresenter) return null

   if (!userPresenter.questionsShouldBeHighlighted()) return null

   return (
      <BadgeButton
         badge={UserPresenter.questionsHighlightedRequiredBadge()}
         showBadgeSuffix={false}
         showIcon={false}
         activeTooltip={tooltipText}
      />
   )
}

export default ViewerTopBar
