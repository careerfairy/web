import PropTypes from "prop-types"
import React, { useState, useRef, useEffect } from "react"
import Draggable from "react-draggable"

const DraggableComponent = ({
   children,
   elementId,
   zIndex,
   bounds,
   positionStyle,
   defaultPosition = { x: 0, y: 0 },
}) => {
   const [position, setPosition] = useState(null)
   const [hasLoaded, setHasLoaded] = useState(false)
   const nodeRef = useRef(null)

   useEffect(() => {
      const existingDivPositions = JSON.parse(localStorage.getItem(elementId))
      setPosition(existingDivPositions)
      setHasLoaded(true)
   }, [])

   function handleStop(e, data) {
      let newPosition = {}
      newPosition["x"] = data.x
      newPosition["y"] = data.y
      setPosition(newPosition)
   }

   useEffect(() => {
      localStorage.setItem(elementId, JSON.stringify(position))
   }, [position])

   return hasLoaded ? (
      <Draggable
         defaultPosition={
            position === null
               ? defaultPosition
               : !position
               ? defaultPosition
               : { x: position.x, y: position.y }
         }
         position={null}
         nodeRef={nodeRef}
         onStop={handleStop}
         bounds={bounds}
      >
         <div
            style={{ zIndex, position: positionStyle, left: "1%", top: "1%" }}
            ref={nodeRef}
         >
            {children}
         </div>
      </Draggable>
   ) : null
}

DraggableComponent.propTypes = {
   elementId: PropTypes.string.isRequired,
   children: PropTypes.node.isRequired,
   bounds: PropTypes.oneOf([
      "parent",
      PropTypes.shape({
         left: PropTypes.number,
         top: PropTypes.number,
         right: PropTypes.number,
         bottom: PropTypes.number,
      }),
   ]),
}

export default DraggableComponent
