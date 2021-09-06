import { Button } from "@material-ui/core";
import Tab from "@material-ui/core/Tab";
import React, { useContext } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext";
import { StyledTooltipWithButton } from "../../../../../../../materialUI/GlobalTooltips";
import { useCurrentStream } from "../../../../../../../context/stream/StreamContext";
import ConditionalWrapper from "../../../../../common/ConditionalWrapper";

const useCtaCardStyles = makeStyles(({ palette: { type, common } }) => ({
   cardRoot: {},
   ctaButton: {
      backgroundColor: (props) => alpha(props.color, 0.1),
      color: (props) => (type === "dark" ? common.white : props.color),
      "& svg": {
         color: (props) => props.color,
      },
   },
}));

const CallToActionTypeButton = ({
   mobile,
   active,
   isJobPosting,
   data: { type, description, title, icon, buttonText, message, value },
   color,
   handleSetCallToActionType,
}) => {
   const { handleConfirmStep, isOpen } = useContext(TutorialContext);
   const {
      currentLivestream: { test },
   } = useCurrentStream();

   const classes = useCtaCardStyles({ color });

   const tutorialStepOpen = isOpen(19, test) && isJobPosting;

   const buttonDisabled = (isOpen(19, test) || isOpen(20, test)) && !isJobPosting

   const handleClick = () => {
      handleSetCallToActionType({
         newType: type,
         newMessage: message,
         newButtonText: buttonText,
         newValue: value,
         newColor: color,
         newTitle: title,
      });
   };

   const handleButtonClick = () => {
      if(tutorialStepOpen){
         handleConfirmStep(19)
      }
      handleClick()
   }

   return (
      <ConditionalWrapper
         condition={tutorialStepOpen}
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
   );
};

export default CallToActionTypeButton;
