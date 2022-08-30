import React, { useContext, useEffect, useState } from "react"
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined"
import HelpIcon from "@mui/icons-material/Help"
import BarChartIcon from "@mui/icons-material/BarChart"
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import SpeedDial from "@mui/material/SpeedDial"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import SpeedDialAction from "@mui/material/SpeedDialAction"
import { ClickAwayListener } from "@mui/material"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import TutorialContext from "../../../../context/tutorials/TutorialContext"
import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import WorkRoundedIcon from "@mui/icons-material/WorkRounded"
import * as storeActions from "store/actions"
import { focusModeEnabledSelector } from "../../../../store/selectors/streamSelectors"

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      top: 0,
      // width: "220px",
      paddingLeft: "30px",
      position: "absolute",
      alignItems: "center",
      transform: "translateY(50%)",
      zIndex: 1000,
      bottom: "50%",
   },
   speedDial: ({ open, focusModeEnabled }) => ({
      transition: theme.transitions.create(["transform", "opacity"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
      opacity: !open && focusModeEnabled ? 0.5 : 1,
      transform: open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-moz-transform": open
         ? ""
         : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-o-transform": open ? "" : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
      "-webkit-transform": open
         ? ""
         : "translate(-20px, 0) scale3d(0.8, 0.8, 0.8)",
   }),
   actionButton: {
      backgroundColor: theme.palette.primary.main,
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(theme.palette.primary.main, 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: theme.palette.primary.dark,
      },
   },
   darkActionButton: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.grey["400"],
      "&:disabled": {
         backgroundColor: alpha(theme.palette.background.paper, 0.5),
         color: theme.palette.primary.main,
      },
      "&:hover": {
         backgroundColor: theme.palette.background.default,
      },
   },
   actionButtonPink: {
      backgroundColor: theme.palette.secondary.main,
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(theme.palette.secondary.main, 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: theme.palette.secondary.dark,
      },
   },
   darkActionButtonPink: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: theme.palette.background.default,
      },
   },
   cardHovered: {},
   tooltip: {
      transition: "all 0.6s",
      transitionTimingFunction: theme.transitions.easeInOut,
      display: ({ open }) => (open ? "block" : "none"),
      whiteSpace: "nowrap",
   },
   dialButton: {
      display: "none",
   },
   "@keyframes blink": {
      "50%": {
         borderColor: theme.palette.secondary.main,
      },
   },
   highlight: {},
   actionButtonHighlight: {
      backgroundColor: theme.palette.primary.main,
      border: "4px solid transparent",
      animation: "$blink .5s step-end infinite alternate",
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(theme.palette.primary.main, 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: theme.palette.primary.dark,
      },
   },
}))

const ButtonComponent = ({
   handleStateChange,
   showMenu,
   isMobile,
   selectedState,
   streamer,
   includeJobs,
   questionsAreDisabled,
}) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const DELAY = 3000 //3 seconds
   const [hasMounted, setHasMounted] = useState(false)
   const dispatch = useDispatch()
   const theme = useTheme()
   const [open, setOpen] = useState(true)
   const [delayHandler, setDelayHandler] = useState(null)
   const { tutorialSteps, handleConfirmStep } = useContext(TutorialContext)

   useEffect(() => {
      setHasMounted(true)
   }, [])

   const tutorialStepActive = () => {
      return Boolean(isOpen(3) || isOpen(8))
   }
   const isValid = (actionTutorialNum, actionDisabled) => {
      return tutorialSteps[actionTutorialNum] && !actionDisabled
   }

   const isOpen = (actionTutorialNum, actionDisabled) => {
      return (
         tutorialSteps.streamerReady &&
         isValid(actionTutorialNum, actionDisabled)
      )
   }
   const classes = useStyles({
      open: open || tutorialStepActive(),
      showMenu,
      isMobile,
      focusModeEnabled,
   })

   const handleMouseEnter = (event) => {
      clearTimeout(delayHandler)
      handleOpen()
   }

   const handleMouseLeave = () => {
      setDelayHandler(
         setTimeout(() => {
            handleClose()
         }, DELAY)
      )
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleToggle = () => {
      setOpen(!open)
   }

   const handleClose = () => {
      setOpen(false)
   }

   if (isMobile && showMenu) {
      return null
   }

   const getActions = () => {
      if (!hasMounted) {
         return []
      }
      const actions = [
         {
            icon: <BarChartIcon fontSize="large" />,
            name: "Polls",
            disabled: showMenu && selectedState === "polls",
            onClick: () => handleStateChange("polls"),
            tutorialNum: 3,
         },
         {
            icon: <HelpIcon fontSize="large" />,
            name: questionsAreDisabled ? "Q&A (Disabled)" : "Q&A",
            disabled:
               questionsAreDisabled ||
               (showMenu && selectedState === "questions"),
            onClick: () => {
               handleStateChange("questions")
            },
            tutorialNum: 2334,
         },
      ]

      if (isMobile || focusModeEnabled) {
         actions.unshift({
            icon: <ForumOutlinedIcon fontSize="large" />,
            name: "Chat",
            disabled: showMenu && selectedState === "chat",
            onClick: () => handleStateChange("chat"),
            tutorialNum: 234,
         })
      }
      if (!isMobile) {
         actions.unshift({
            icon: <PanToolOutlinedIcon />,
            name: "Hand Raise",
            disabled: showMenu && selectedState === "hand",
            onClick: () => handleStateChange("hand"),
            tutorialNum: 8,
         })
      }

      if (includeJobs) {
         actions.unshift({
            icon: <WorkRoundedIcon fontSize="large" />,
            name: "Jobs",
            disabled: false,
            onClick: () => handleStateChange("jobs"),
            tutorialNum: 999999,
         })
      }

      if ((streamer || focusModeEnabled || questionsAreDisabled) && showMenu) {
         actions.unshift({
            icon: <ChevronLeftRoundedIcon fontSize="large" />,
            name: "",
            disabled: false,
            onClick: () => dispatch(storeActions.toggleLeftMenu()),
            tutorialNum: 9999999,
         })
      }

      return actions
   }

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={classes.root}
         >
            <SpeedDial
               ariaLabel="interaction-selector"
               className={classes.speedDial}
               FabProps={{
                  onClick: handleToggle,
                  className: classes.dialButton,
               }}
               icon={<SpeedDialIcon />}
               onFocus={handleOpen}
               open
            >
               {getActions().map((action) => {
                  return (
                     <SpeedDialAction
                        key={action.tutorialNum}
                        icon={action.icon}
                        tooltipPlacement="right"
                        tooltipTitle={action.name}
                        classes={{ staticTooltipLabel: classes.tooltip }}
                        tooltipOpen={Boolean(action.name.length)}
                        onClick={() => {
                           action.onClick()
                           isOpen(action.tutorialNum, action.disabled) &&
                              handleConfirmStep(action.tutorialNum)
                        }}
                        FabProps={{
                           size: "large",
                           classes: {
                              root: clsx(classes.fab, {
                                 [classes.actionButtonHighlight]: isOpen(
                                    action.tutorialNum,
                                    action.disabled
                                 ),
                                 [classes.actionButton]: action.name.length,
                                 [classes.actionButtonPink]:
                                    !action.name.length,
                                 [classes.darkActionButton]:
                                    theme.palette.mode === "dark",
                                 [classes.darkActionButtonPink]:
                                    !action.name.length &&
                                    theme.palette.mode === "dark",
                              }),
                           },
                           "data-testid": `streaming-${action.name}`,
                           disabled: action.disabled,
                        }}
                     />
                  )
               })}
            </SpeedDial>
         </div>
      </ClickAwayListener>
   )
}

export default ButtonComponent
