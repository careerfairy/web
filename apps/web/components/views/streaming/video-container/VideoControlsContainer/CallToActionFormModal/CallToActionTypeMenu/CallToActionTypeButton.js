import { Button } from "@mui/material"
import { alpha } from "@mui/material/styles"
import Tab from "@mui/material/Tab"
import makeStyles from "@mui/styles/makeStyles"
import { useContext } from "react"
import { useCurrentStream } from "../../../../../../../context/stream/StreamContext"
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext"
import { StyledTooltipWithButton } from "../../../../../../../materialUI/GlobalTooltips"
import { ConditionalWrapper } from "../../../../../common/ConditionalWrapper"

const useCtaCardStyles = makeStyles(({ palette: { mode, common } }) => ({
   cardRoot: {},
   ctaButton: {
      backgroundColor: (props) => alpha(props.color, 0.1),
      color: (props) => (mode === "dark" ? common.white : props.color),
      "& svg": {
         color: (props) => props.color,
      },
   },
}))

const CallToActionTypeButton = ({
   mobile,
   active,
   isJobPosting,
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   data: { type, description, title, icon, buttonText, message, value },
   color,
   handleSetCallToActionType,
}) => {
   const { handleConfirmStep, isOpen } = useContext(TutorialContext)
   const {
      currentLivestream: { test },
   } = useCurrentStream()

   const classes = useCtaCardStyles({ color })

   const tutorialStepOpen = isOpen(19, test) && isJobPosting

   const buttonDisabled =
      (isOpen(19, test) || isOpen(20, test)) && !isJobPosting

   const handleClick = () => {
      handleSetCallToActionType({
         newType: type,
         newMessage: message,
         newButtonText: buttonText,
         newValue: value,
         newColor: color,
         newTitle: title,
      })
   }

   const handleButtonClick = () => {
      if (tutorialStepOpen) {
         handleConfirmStep(19)
      }
      handleClick()
   }

   return (
      <ConditionalWrapper
         condition={Boolean(tutorialStepOpen)}
         wrapper={(children) => (
            <StyledTooltipWithButton
               open={tutorialStepOpen}
               tooltipTitle="Share Job Posts (3/8)"
               placement="top"
               buttonText="Share a job posting"
               onConfirm={handleButtonClick}
               tooltipText="Choose between sharing job posts, social media channels or custom messages."
            >
               {children}
            </StyledTooltipWithButton>
         )}
      >
         {mobile ? (
            <Button
               className={classes.ctaButton}
               disabled={buttonDisabled}
               fullWidth
               onClick={handleButtonClick}
               startIcon={icon}
               variant={active ? "outlined" : "text"}
            >
               {title}
            </Button>
         ) : (
            <Tab
               className={classes.ctaButton}
               value={type}
               disabled={buttonDisabled}
               onClick={handleButtonClick}
               icon={icon}
               label={title}
            />
         )}
      </ConditionalWrapper>
   )
}

export default CallToActionTypeButton
