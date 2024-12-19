import FramerBox from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import { FeedbackCard } from "./FeedbackCard"
import { styles } from "./styles"

type FeedbackSectionProps = {
   isVisible: boolean
   enableRating: boolean
   isShorterScreen: boolean
   onRatingClick: () => void
}

export const FeedbackSection = ({
   isVisible,
   enableRating,
   isShorterScreen,
   onRatingClick,
}: FeedbackSectionProps) => {
   if (!isVisible) return null

   return (
      <FramerBox
         key="feedback"
         animate={enableRating || isShorterScreen ? "center" : "animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={feedbackVariants}
         sx={styles.feedbackCard}
      >
         <FeedbackCard onRatingClick={onRatingClick} preview={!enableRating} />
      </FramerBox>
   )
}

const feedbackVariants: Variants = {
   initial: {
      opacity: 0,
      bottom: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
      bottom: 0,
      y: 0,
   },
   exit: { opacity: 0 },
   center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
      top: "50%",
      transform: "translateY(-50%)",
   },
}
