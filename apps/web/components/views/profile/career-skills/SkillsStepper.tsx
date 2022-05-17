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
import InfoIcon from "@mui/icons-material/Info"
import { createStyles } from "@mui/styles"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import Box from "@mui/material/Box"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import CircleIcon from "@mui/icons-material/Circle"
import { useAuth } from "../../../../HOCs/AuthProvider"
import CheckIcon from "@mui/icons-material/Check"

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
   listItemAvatar: { minWidth: "30px" },
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
   },
   stepperIconInfo: {
      width: "1.2em",
      height: "1.2em",
   },
})

export const BadgeStepper = ({ badge }: { badge: Badge }) => {
   const steps = getBadgesArray(badge)

   return (
      <Stepper nonLinear activeStep={1} connector={<ColorlibConnector />}>
         {steps.map((badge) => (
            <Step key={badge.key} completed={false} disabled sx={styles.step}>
               <StepLabel
                  StepIconComponent={IconContainer}
                  StepIconProps={
                     {
                        badge,
                     } as any
                  }
                  sx={styles.stepLabel}
               />
            </Step>
         ))}
      </Stepper>
   )
}

/**
 * Convert a linked list badge to an array of badges
 *
 * @param badge
 */
function getBadgesArray(badge: Badge): Badge[] {
   const steps = [badge]

   let curr = badge.next
   while (curr) {
      steps.push(curr)
      curr = curr.next
   }

   return steps
}

const LevelInformationPopup = ({ badge }: { badge: Badge }) => {
   const finalRewards =
      badge.rewardsDescription.length > 0
         ? badge.rewardsDescription
         : ["A cool badge!"]
   const { userData, userStats } = useAuth()

   return (
      <Box>
         <Typography variant="h6" mb={1}>
            Level {badge.level}
         </Typography>
         <Typography>You will be rewarded:</Typography>
         <List disablePadding>
            {finalRewards.map((reward, index) => (
               <LevelInformationPopupListItem
                  key={`reward_${index}`}
                  description={reward}
               />
            ))}
         </List>

         <Typography>To reach this level:</Typography>
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

const LevelInformationPopupListItem = ({ description, isComplete = false }) => (
   <ListItem>
      <ListItemAvatar sx={styles.listItemAvatar}>
         {isComplete ? (
            <CheckIcon color="primary" sx={styles.tooltipRequirementCheck} />
         ) : (
            <CircleIcon color="primary" sx={styles.tooltipRequirementCircle} />
         )}
      </ListItemAvatar>
      <ListItemText primary={description} />
   </ListItem>
)

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
   const { userData, userStats } = useAuth()

   let Icon = <InfoIcon color="secondary" sx={styles.stepperIconInfo} />
   if (badge.isComplete(userData, userStats)) {
      Icon = <CheckIcon color="secondary" sx={styles.stepperIconCheck} />
   }

   return (
      <Tooltip
         title={<LevelInformationPopup badge={badge} />}
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
