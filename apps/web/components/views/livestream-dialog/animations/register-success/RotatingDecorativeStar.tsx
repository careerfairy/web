import FramerBox from "components/views/common/FramerBox"
import { DecorativeStar } from "./DecorativeStar"
import { ANIMATION_CONFIG } from "./animationConfig"

export type Props = {
   top?: string | number
   left?: string | number
   right?: string | number
   bottom?: string | number
   color?: string
   size?: number
   opacity?: number | string
   /**
    * Used to stagger the animation of the stars
    */
   index?: number
   isAnimating?: boolean
   exitAnimation?: boolean
}

export const RotatingDecorativeStar = ({
   top,
   left,
   right,
   bottom,
   color,
   size,
   opacity,
   index = 0,
   isAnimating = false,
   exitAnimation = false,
}: Props) => {
   // Calculate starting position based on placement
   // Stars will slide in from the direction they're positioned
   const getInitialOffset = () => {
      const offset = "10%" // How far the stars will slide in from the direction they're positioned
      if (left !== undefined) return { x: `-${offset}`, y: 0 }
      if (right !== undefined) return { x: offset, y: 0 }
      if (top !== undefined) return { x: 0, y: `-${offset}` }
      if (bottom !== undefined) return { x: 0, y: offset }
      return { x: 0, y: 0 }
   }

   const initialOffset = getInitialOffset()

   return (
      <FramerBox
         initial={{
            opacity: 0,
            x: initialOffset.x,
            y: initialOffset.y,
         }}
         animate={{
            opacity: exitAnimation ? 0 : isAnimating ? opacity : 0,
            x: 0,
            y: exitAnimation ? "-120%" : 0,
            rotate: exitAnimation ? 360 : 360,
         }}
         transition={{
            opacity: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : ANIMATION_CONFIG.stars.duration,
               delay: exitAnimation
                  ? 0
                  : ANIMATION_CONFIG.stars.delay +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
            },
            x: {
               duration: ANIMATION_CONFIG.stars.duration,
               delay:
                  ANIMATION_CONFIG.stars.delay +
                  index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: "easeOut",
            },
            y: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : ANIMATION_CONFIG.stars.duration,
               delay: exitAnimation
                  ? 0
                  : ANIMATION_CONFIG.stars.delay +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: exitAnimation ? "easeInOut" : "easeOut",
            },
            rotate: {
               duration: 6,
               repeat: Infinity,
               ease: "linear",
            },
         }}
         sx={{
            position: "absolute",
            top,
            left,
            right,
            bottom,
         }}
      >
         <DecorativeStar sx={{ color, width: size, height: size }} />
      </FramerBox>
   )
}
