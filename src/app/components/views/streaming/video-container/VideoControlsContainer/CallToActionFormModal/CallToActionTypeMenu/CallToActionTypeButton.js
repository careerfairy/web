import { Button } from "@material-ui/core";
import Tab from "@material-ui/core/Tab";
import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";

const useCtaCardStyles = makeStyles((theme) => ({
   cardRoot: {},
   ctaButton: {
      backgroundColor: (props) => alpha(props.color, 0.1),
      color: (props) => props.color,
      "& svg": {
         color: (props) => props.color,
      },
   },
}));

const CallToActionTypeButton = ({
   mobile,
   active,
   data: { type, description, title, icon, buttonText, message, value },
   color,
   handleSetCallToActionType,
}) => {
   const classes = useCtaCardStyles({ color });

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

   return mobile ? (
      <Button
         className={classes.ctaButton}
         fullWidth
         onClick={handleClick}
         startIcon={icon}
         variant={active ? "outlined" : "text"}
      >
         {title}
      </Button>
   ) : (
      <Tab
         className={classes.ctaButton}
         value={type}
         onClick={handleClick}
         icon={icon}
         label={title}
      />
   );
};

export default CallToActionTypeButton;
