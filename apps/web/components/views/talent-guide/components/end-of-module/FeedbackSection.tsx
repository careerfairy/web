import FramerBox from "components/views/common/FramerBox"
import { Variants } from "framer-motion"
import { FeedbackCard } from "./FeedbackCard"
import { styles } from "./styles"

type Props = {
   enableRating: boolean
   isShorterScreen: boolean
   onRatingClick: () => void
   onFeedbackSubmitted: () => void
}

export const FeedbackSection = ({
   enableRating,
   isShorterScreen,
   onRatingClick,
   onFeedbackSubmitted,
}: Props) => {
   return (
      <FramerBox
         animate={enableRating || isShorterScreen ? "center" : "animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={feedbackVariants}
         sx={[
            styles.feedbackCard,
            {
               pb: isShorterScreen ? 3.5 : 4,
            },
         ]}
      >
         <FeedbackCard
            onRatingClick={onRatingClick}
            preview={!enableRating}
            onFeedbackSubmitted={onFeedbackSubmitted}
         />
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
   center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
      top: "50%",
      transform: "translateY(-50%)",
   },
   exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
      transform: "translateY(0px)",
   },
}
