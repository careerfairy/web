import { Variants } from "framer-motion"
import { FramerBoxProps } from "../../../common/FramerBox"

export const growAndFadeAnimation: FramerBoxProps = {
   animate: {
      opacity: 1,
      scale: 1,
      transition: {
         type: "spring",
         duration: 0.5,
         opacity: {
            duration: 0.7,
            ease: "easeOut",
         },
      },
   },
   initial: {
      opacity: 0,
      scale: 0.8,
   },
}

export const ratingTitleAnimation: FramerBoxProps = {
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         type: "spring",
         stiffness: 300,
         damping: 25,
      },
   },
   initial: {
      opacity: 0,
      y: 20,
   },
   exit: {
      opacity: 0,
      y: -20,
   },
}

export const nextModuleVariants: Variants = {
   initial: {
      opacity: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         ease: "easeOut",
         staggerChildren: 0.1,
      },
   },
   exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
   },
}

export const dividerVariants: Variants = {
   initial: {
      scaleY: 0,
      originY: 0,
   },
   animate: {
      scaleY: 1,
      transition: {
         duration: 1,
         ease: "easeOut",
      },
   },
}

export const bottomContentVariants: Variants = {
   initial: {
      opacity: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         ease: "easeOut",
      },
   },
}
