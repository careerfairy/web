import React, {
   useState,
   useRef,
   useEffect,
   useCallback,
   CSSProperties,
   useMemo,
} from "react"
import Draggable from "react-draggable"

type Props = {
   children: React.ReactNode
   elementId: string
   bounds:
      | "parent"
      | { left: number; top: number; right: number; bottom: number }
   defaultPosition: { x: number; y: number }
   positionStyle: CSSProperties["position"]
   zIndex: CSSProperties["zIndex"]
}

const DraggableComponent = ({
   children,
   elementId,
   zIndex,
   bounds,
   positionStyle,
   defaultPosition = { x: 0, y: 0 },
}: Props) => {
   const [position, setPosition] = useState(null)
   const [hasLoaded, setHasLoaded] = useState(false)
   const nodeRef = useRef(null)

   useEffect(() => {
      const existingDivPositions = JSON.parse(localStorage.getItem(elementId))
      setPosition(existingDivPositions)
      setHasLoaded(true)
   }, [elementId])

   const handleStop = useCallback((e, data) => {
      let newPosition = {}
      newPosition["x"] = data.x
      newPosition["y"] = data.y
      setPosition(newPosition)
   }, [])

   useEffect(() => {
      localStorage.setItem(elementId, JSON.stringify(position))
   }, [elementId, position])

   const defaultPositionCalculated = useMemo(() => {
      if (!position) return defaultPosition

      return { x: position.x, y: position.y }
   }, [defaultPosition, position])

   return hasLoaded ? (
      <Draggable
         defaultPosition={defaultPositionCalculated}
         position={null}
         nodeRef={nodeRef}
         onStop={handleStop}
         bounds={bounds}
      >
         <div
            style={{ zIndex, position: positionStyle, padding: "8px" }}
            ref={nodeRef}
         >
            {children}
         </div>
      </Draggable>
   ) : null
}

export default DraggableComponent
