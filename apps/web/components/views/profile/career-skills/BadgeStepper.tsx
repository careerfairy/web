import {
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Step,
   StepLabel,
   Stepper,
   Tooltip,
   Typography,
} from "@mui/material"
import React, { useCallback, useState } from "react"
import { alpha, styled } from "@mui/material/styles"
import StepConnector, {
   stepConnectorClasses,
} from "@mui/material/StepConnector"
import IconButton from "@mui/material/IconButton"
import { createStyles } from "@mui/styles"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import Box from "@mui/material/Box"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import CircleIcon from "@mui/icons-material/Circle"
import { useAuth } from "../../../../HOCs/AuthProvider"
import CheckIcon from "@mui/icons-material/Check"
import CelebrationIcon from "@mui/icons-material/Celebration"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import useBadgeStepProgress from "../../../custom-hook/useBadgeStepProgress"
import CareerCoinIcon from "components/views/common/CareerCoinIcon"

const styles = createStyles({
   step: {
      padding: 0,
   },
   stepLabel: {
      padding: 0,
      margin: 0,
      "& .MuiStepLabel-iconContainer": {
         padding: 0,
      },
   },
   tooltip: {
      backgroundColor: "background.paper",
      color: "text.primary",
      boxShadow: (theme: DefaultTheme) => theme.boxShadows.dark_8_25_10,
      padding: 2,
      borderRadius: "10px",
   },
   tooltipRequirementCircle: {
      width: "0.5em",
      height: "0.5em",
   },
   tooltipRequirementCheck: {
      width: "0.9em",
      height: "0.9em",
   },
   listItemAvatar: {
      minWidth: "30px",
      paddingRight: "10px",
      textAlign: "center",
   },
   iconCurrent: {
      backgroundColor: (theme: DefaultTheme) =>
         alpha(theme.palette.secondary.main, 0.1),
      "&:hover": {
         backgroundColor: (theme: DefaultTheme) =>
            alpha(theme.palette.secondary.main, 0.15),
      },
   },
   stepperIconCheck: {
      border: (theme: DefaultTheme) =>
         `3px solid ${theme.palette.secondary.main}`,
      borderRadius: "50%",
      width: "1.2em",
      height: "1.2em",
      padding: "2px",
      color: "background.default",
      backgroundColor: "secondary.main",
   },
   stepperIconInfo: {
      width: "1.2em",
      height: "1.2em",
   },
})

export const BadgeStepper = ({ badge }: { badge: Badge }) => {
   const { userPresenter, userStats } = useAuth()

   const { activeStep, steps } = useBadgeStepProgress(
      badge,
      userStats,
      userPresenter
   )

   return (
      <Stepper
         nonLinear
         activeStep={activeStep}
         connector={<ColorlibConnector />}
      >
         {steps.map((badge, index) => (
            <Step
               key={badge.key}
               completed={index < activeStep}
               disabled
               sx={styles.step}
            >
               <StepLabel
                  StepIconComponent={IconContainer}
                  StepIconProps={
                     {
                        badge,
                        isCurrent: activeStep === index,
                     } as any
                  }
                  sx={styles.stepLabel}
               />
            </Step>
         ))}
      </Stepper>
   )
}

const LevelInformationPopup = ({
   badge,
   isComplete,
}: {
   badge: Badge
   isComplete: boolean
}) => {
   const finalRewards =
      badge.rewardsDescription.length > 0
         ? badge.rewardsDescription
         : ["A cool badge!"]
   const { userData, userStats } = useAuth()

   let rewardText = "You will be rewarded"
   if (isComplete) {
      rewardText = "You have been rewarded with"
   }

   return (
      <Box>
         <Typography variant="h6" mb={1}>
            Level {badge.level}
         </Typography>
         <Typography marginY={1}>{rewardText}:</Typography>
         <List disablePadding>
            {finalRewards.map((reward, index) => (
               <LevelInformationPopupListItem
                  key={`reward_${index}`}
                  description={reward}
                  isAchieved={isComplete}
               />
            ))}
         </List>

         <Typography marginY={1}>To reach this level:</Typography>
         <List disablePadding>
            {badge.requirements.map((requirement, index) => (
               <LevelInformationPopupListItem
                  key={`reward_${index}`}
                  description={requirement.description}
                  isComplete={requirement.isComplete(userData, userStats)}
               />
            ))}
         </List>
      </Box>
   )
}

export const LevelInformationPopupListItem = ({
   description,
   isComplete = false,
   isAchieved = false,
}) => {
   let Icon: JSX.Element = (
      <CircleIcon color="primary" sx={styles.tooltipRequirementCircle} />
   )

   const isCoin = description.includes("CareerCoin")
   if (isCoin) {
      Icon = <CareerCoinIcon />
   }

   if (isAchieved) {
      Icon = (
         <CelebrationIcon color="primary" sx={styles.tooltipRequirementCheck} />
      )
   }

   if (isComplete) {
      Icon = <CheckIcon color="primary" sx={styles.tooltipRequirementCheck} />
   }

   return (
      <ListItem
         sx={{ paddingY: 0 }}
         secondaryAction={
            (isComplete || isAchieved) && isCoin ? (
               <CareerCoinIcon />
            ) : undefined
         }
      >
         <ListItemAvatar sx={styles.listItemAvatar}>{Icon}</ListItemAvatar>
         <ListItemText primary={description} />
      </ListItem>
   )
}

const IconContainer = ({
   badge,
   isCurrent,
}: {
   badge: Badge
   isCurrent: boolean
}) => {
   const [showTooltip, setShowTooltip] = useState(false)
   const openTooltip = useCallback(() => setShowTooltip(true), [])
   const hideTooltip = useCallback(() => setShowTooltip(false), [])
   const { userPresenter } = useAuth()
   const currentBadgeLevel =
      userPresenter.badges?.getCurrentBadgeLevelForBadgeType(badge)

   let Icon = <InfoOutlinedIcon color="secondary" sx={styles.stepperIconInfo} />
   if (currentBadgeLevel) {
      // user has this badge
      Icon = <CheckIcon color="secondary" sx={styles.stepperIconCheck} />
   }

   return (
      <Tooltip
         title={
            <LevelInformationPopup
               badge={badge}
               isComplete={Boolean(currentBadgeLevel)}
            />
         }
         componentsProps={{
            tooltip: {
               sx: styles.tooltip,
            },
            arrow: {
               sx: {
                  color: "background.paper",
               },
            },
         }}
         arrow
         open={showTooltip}
         onOpen={openTooltip}
         onClose={hideTooltip}
         leaveDelay={300}
      >
         <IconButton
            sx={isCurrent ? styles.iconCurrent : undefined}
            onClick={openTooltip}
         >
            {Icon}
         </IconButton>
      </Tooltip>
   )
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
   [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
   },
   [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         backgroundColor: theme.palette.secondary.main,
      },
   },
   [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
         backgroundColor: theme.palette.secondary.main,
      },
   },
   [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor:
         theme.palette.mode === "dark" ? theme.palette.grey[800] : "#FAEDF2",
      borderRadius: 1,
   },
}))
