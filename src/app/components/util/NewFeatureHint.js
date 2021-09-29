import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyledTooltipWithButton } from "../../materialUI/GlobalTooltips";

const NewFeatureHint = ({
   children,
   localStorageKey,
   tooltipText,
   buttonText,
   tooltipTitle,
   placement,
   onClick,
  hide
}) => {
   const [hasSeenTip, setHasSeenTip] = useState(false);

   useEffect(() => {
      const hasSeenDataSetButton = localStorage.getItem(localStorageKey);
      if (JSON.parse(hasSeenDataSetButton)) {
         setHasSeenTip(true);
      }
   }, []);

   const markAsSeen = () => {
      localStorage.setItem(localStorageKey, JSON.stringify(true));
      setHasSeenTip(true);
   };

   const handleSeen = () => {
      markAsSeen();
      onClick?.();
   };

   return (
      <StyledTooltipWithButton
         placement={placement}
         open={!hasSeenTip && !hide}
         tooltipTitle={tooltipTitle}
         onConfirm={handleSeen}
         tooltipText={tooltipText}
         buttonText={buttonText}
      >
         <div onClick={handleSeen} style={{ cursor: "pointer" }}>
            {children}
         </div>
      </StyledTooltipWithButton>
   );
};

NewFeatureHint.propTypes = {
   buttonText: PropTypes.string,
   children: PropTypes.node.isRequired,
   localStorageKey: PropTypes.string.isRequired,
   onClick: PropTypes.func,
   placement: PropTypes.oneOf([
      "bottom-end",
      "bottom-start",
      "bottom",
      "left-end",
      "left-start",
      "left",
      "right-end",
      "right-start",
      "right",
      "top-end",
      "top-start",
      "top",
   ]),
   tooltipText: PropTypes.string,
   tooltipTitle: PropTypes.string,
};

export default NewFeatureHint;
