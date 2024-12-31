import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence, Variants } from "framer-motion"
import React, { ReactElement, useCallback, useRef } from "react"
import { useProgressHeaderHeight } from "../components/TalentGuideProgress"

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

type AnimatedStepContentProps = {
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

   const scrollOffset = useProgressHeaderHeight()
   const scrollPadding = 15 // Give a little space between the last step and the sticky progress bar

   const handleAnimationComplete = useCallback(
      (isLastStep: boolean) => {
         if (!isLastStep) return

         const element = lastStepRef.current
         if (!element) return

         const elementPosition = element.getBoundingClientRect().top
         const offsetPosition =
            elementPosition + window.scrollY - scrollOffset - scrollPadding

         window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
         })
      },
      [scrollOffset]
   )

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
                     onAnimationComplete={() =>
                        handleAnimationComplete(isLastStep)
                     }
                  >
                     {child}
                  </FramerBox>
               )
            })}
         </AnimatePresence>
      </FramerBox>
   )
}
