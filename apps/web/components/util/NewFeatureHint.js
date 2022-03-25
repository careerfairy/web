import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { StyledTooltipWithButton } from "../../materialUI/GlobalTooltips"

const NewFeatureHint = ({
   children,
   localStorageKey,
   tooltipText,
   buttonText,
   tooltipTitle,
   placement,
   onClickConfirm,
   hide,
}) => {
   const [hasSeenTip, setHasSeenTip] = useState(false)
   const {
      query: { isRecordingWindow },
   } = useRouter()

   useEffect(() => {
      const hasSeenDataSetButton = localStorage.getItem(localStorageKey)
      setHasSeenTip(Boolean(JSON.parse(hasSeenDataSetButton)))
   }, [localStorageKey])

   const markAsSeen = () => {
      localStorage.setItem(localStorageKey, JSON.stringify(true))
      setHasSeenTip(true)
   }

   const handleSeen = () => {
      markAsSeen()
      onClickConfirm?.()
   }

   return (
      <StyledTooltipWithButton
         placement={placement}
         open={!hasSeenTip && !hide && !isRecordingWindow}
         tooltipTitle={tooltipTitle}
         onConfirm={handleSeen}
         tooltipText={tooltipText}
         buttonText={buttonText}
      >
         <span onClick={handleSeen} style={{ cursor: "pointer" }}>
            {children}
         </span>
      </StyledTooltipWithButton>
   )
}

NewFeatureHint.propTypes = {
   buttonText: PropTypes.string,
   children: PropTypes.node.isRequired,
   localStorageKey: PropTypes.string.isRequired,
   onClickConfirm: PropTypes.func,
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
}

export default NewFeatureHint
