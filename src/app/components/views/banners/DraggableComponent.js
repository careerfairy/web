import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

const DraggableComponent = ({ children, elementId, zIndex, bounds }) => {
   const [position, setPosition] = useState(null);
   console.log("-> position", position);
   const [hasLoaded, setHasLoaded] = useState(false);
   const nodeRef = useRef(null);

   useEffect(() => {
      const existingDivPositions = JSON.parse(localStorage.getItem(elementId));
      setPosition(existingDivPositions);
      setHasLoaded(true);
      console.log(existingDivPositions);
      console.log("-> has loaded");
   }, []);

   function handleStop(e, data) {
      let newPosition = {}
      newPosition["x"] = data.x;
      newPosition["y"] = data.y;
      console.log("-> newPosition", newPosition);
      setPosition(newPosition);
   }

   useEffect(() => {
      localStorage.setItem(elementId, JSON.stringify(position));
   }, [position]);

   return hasLoaded ? (
      <Draggable
         defaultPosition={
            position === null
               ? { x: 0, y: 0 }
               : !position
               ? { x: 0, y: 0 }
               : { x: position.x, y: position.y }
         }
         position={null}
         nodeRef={nodeRef}
         onStop={handleStop}
         bounds={bounds}
      >
         <div style={{ zIndex }} ref={nodeRef}>
            {children}
         </div>
      </Draggable>
   ) : null;
};

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
};

export default DraggableComponent;
