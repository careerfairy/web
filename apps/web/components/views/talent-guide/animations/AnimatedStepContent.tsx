import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence, Variants } from "framer-motion"
import React, { ReactElement, useRef } from "react"

const containerVariants: Variants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.2,
      },
   },
}

const stepVariants: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
   },
   exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
   },
}

interface AnimatedStepContentProps {
   children: ReactElement[]
}

/**
 * A component that animates the display of talent guide module steps.
 *
 * Uses Framer Motion to animate steps appearing and disappearing with a staggered fade and slide effect.
 * The last step will smoothly scroll into view when it becomes visible.
 *
 * @param {Object} props - The component props
 * @param {ReactElement[]} props.children - Array of React elements to display and animate
 */
export const AnimatedStepContent = ({ children }: AnimatedStepContentProps) => {
   const lastStepRef = useRef<HTMLDivElement>(null)

   return (
      <FramerBox
         variants={containerVariants}
         initial="hidden"
         animate="visible"
      >
         <AnimatePresence mode="sync">
            {React.Children.map(children, (child, index) => {
               const isLastStep = index === React.Children.count(children) - 1
               return (
                  <FramerBox
                     key={child.key}
                     ref={isLastStep ? lastStepRef : undefined}
                     variants={stepVariants}
                     initial="hidden"
                     animate="visible"
                     exit="exit"
                     onAnimationComplete={() => {
                        if (isLastStep) {
                           lastStepRef.current?.scrollIntoView({
                              behavior: "smooth",
                           })
                        }
                     }}
                  >
                     {child}
                  </FramerBox>
               )
            })}
         </AnimatePresence>
      </FramerBox>
   )
}
