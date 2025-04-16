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
   /**
    * Starting rotation angle in degrees
    */
   startRotation?: number
   /**
    * Ending rotation angle in degrees
    */
   endRotation?: number
   /**
    * Duration of the rotation animation in ms
    */
   rotationDuration?: number
   /**
    * Easing function for the animation
    */
   animationEasing?: "easeOut" | "easeIn" | "easeInOut" | "linear"
   /**
    * Delay before the star appears after the turquoise screen is shown (in ms)
    */
   appearDelay?: number
   /**
    * Duration for the star to reach full opacity and scale (in ms)
    */
   appearDuration?: number
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
   startRotation = 0,
   endRotation = 360,
   rotationDuration = 6000,
   animationEasing = "easeOut",
   appearDelay = 150,
   appearDuration = 600,
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

   // Convert ms to seconds for Framer Motion
   const appearDelaySeconds = appearDelay / 1000
   const appearDurationSeconds = appearDuration / 1000
   const rotationDurationSeconds = rotationDuration / 1000

   return (
      <FramerBox
         initial={{
            opacity: 0,
            x: initialOffset.x,
            y: initialOffset.y,
            rotate: startRotation,
            scale: 0.8,
         }}
         animate={{
            opacity: exitAnimation ? 0 : isAnimating ? opacity : 0,
            scale: exitAnimation ? 0.8 : isAnimating ? 1 : 0.8,
            x: 0,
            y: exitAnimation ? "-120%" : 0,
            rotate: exitAnimation ? endRotation : endRotation,
         }}
         transition={{
            opacity: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : appearDurationSeconds,
               delay: exitAnimation
                  ? 0
                  : appearDelaySeconds +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: animationEasing,
            },
            scale: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : appearDurationSeconds,
               delay: exitAnimation
                  ? 0
                  : appearDelaySeconds +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: animationEasing,
            },
            x: {
               duration: appearDurationSeconds,
               delay:
                  appearDelaySeconds +
                  index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: animationEasing,
            },
            y: {
               duration: exitAnimation
                  ? ANIMATION_CONFIG.container.slideOut
                  : appearDurationSeconds,
               delay: exitAnimation
                  ? 0
                  : appearDelaySeconds +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
               ease: exitAnimation ? "easeInOut" : animationEasing,
            },
            rotate: {
               duration: rotationDurationSeconds,
               ease: animationEasing,
               delay: exitAnimation
                  ? 0
                  : appearDelaySeconds +
                    index * ANIMATION_CONFIG.stars.staggerDelay,
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
