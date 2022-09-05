import React from "react"
import PropTypes from "prop-types"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import Slide from "@mui/material/Slide"

function HideOnScroll(props) {
   const { children, disabled, forceShow } = props
   // Note that you normally won't need to set the window ref as useScrollTrigger
   // will default to window.
   // This is only being set here because the demo is in an iframe.
   const trigger = useScrollTrigger({ disableHysteresis: true })
   return (
      <Slide
         appear={false}
         direction="down"
         in={(!trigger && !disabled) || forceShow}
      >
         {children}
      </Slide>
   )
}

HideOnScroll.propTypes = {
   TransitionComponent: PropTypes.node,
   children: PropTypes.element.isRequired,
   disabled: PropTypes.any,
}
export default HideOnScroll
