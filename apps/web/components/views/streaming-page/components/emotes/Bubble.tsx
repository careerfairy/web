import FramerBox from "components/views/common/FramerBox"
import { MotionProps } from "framer-motion"
import { ReactNode } from "react"

type Props = {
   children: ReactNode
}

const initial: MotionProps["initial"] = { opacity: 0, scale: 0.5 }
const animate: MotionProps["animate"] = {
   opacity: 1,
   scale: 1,
}

const transition: MotionProps["transition"] = {
   duration: 0.1,
   ease: [0, 0.71, 0.2, 1.01],
   scale: {
      type: "spring",
      damping: 5,
      stiffness: 100,
      restDelta: 0.001,
   },
}

export const Bubble = ({ children }: Props) => {
   return (
      <FramerBox initial={initial} animate={animate} transition={transition}>
         {children}
      </FramerBox>
   )
}
