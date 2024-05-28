import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import FramerBox from "components/views/common/FramerBox"
import { MotionProps } from "framer-motion"
import { ReactNode, memo, useMemo } from "react"
import { removeEmote } from "store/reducers/streamingAppReducer"
import { sxStyles } from "types/commonTypes"
import { ClapEmote, ConfusedEmote, HeartEmote, LikeEmote } from "./icons"

const styles = sxStyles({
   root: {
      position: "fixed",
      bottom: 0, // Start from the bottom
      right: 5,
      width: 45,
      height: 45,
   },
})

const DESKTOP_WIGGLE_ROOM = 100
const MOBILE_WIGGLE_ROOM = 50

const EMOTES: Record<EmoteType, ReactNode> = {
   [EmoteType.CONFUSED]: <ConfusedEmote />,
   [EmoteType.LIKE]: <LikeEmote />,
   [EmoteType.HEART]: <HeartEmote />,
   [EmoteType.CLAPPING]: <ClapEmote />,
}

const getInitial = (randomX: number): MotionProps["initial"] => ({
   y: "0",
   scale: 0.5,
   opacity: 0,
   x: -randomX,
})

const getAnimate = (randomDuration: number): MotionProps["animate"] => ({
   y: "-100vh",
   scale: [0.6, 1.2, 0.8, 1], // Rubber effect at start
   rotate: [0, -18, 18, -13, 13, -5, 5, 0], // Wiggle effect
   opacity: [0, 1, 1, 1, 1, 1, 0],
   transition: {
      duration: randomDuration,
   },
})

const transition: MotionProps["transition"] = {
   type: "spring",
   stiffness: 1000, // Increase stiffness for faster acceleration
   damping: 12, // Adjust damping to control overshoot
}

type Props = {
   emote: {
      id: string
      type: EmoteType
   }
}

export const AnimatedEmote = memo(
   ({ emote }: Props) => {
      const streamIsMobile = useStreamIsMobile()
      const dispatch = useAppDispatch()

      const initial = useMemo(
         () => getInitial(getRandomXPosition(streamIsMobile)),
         [streamIsMobile]
      )

      const animate = useMemo(() => getAnimate(getRandomInteger(4.7, 5)), [])

      const removeEmoteFromStore = () => {
         dispatch(removeEmote(emote.id))
      }

      return (
         <FramerBox
            sx={styles.root}
            initial={initial}
            animate={animate}
            transition={transition}
            onAnimationComplete={removeEmoteFromStore}
         >
            {EMOTES[emote.type]}
         </FramerBox>
      )
   },
   (prevProps, nextProps) => prevProps.emote.id === nextProps.emote.id
)

const getRandomInteger = (min: number, max: number) => {
   return Math.random() * (max - min + 1) + min
}

const getRandomXPosition = (streamIsMobile: boolean) => {
   return Math.floor(
      Math.random() *
         (streamIsMobile ? MOBILE_WIGGLE_ROOM : DESKTOP_WIGGLE_ROOM)
   )
}

AnimatedEmote.displayName = "AnimatedEmote"
