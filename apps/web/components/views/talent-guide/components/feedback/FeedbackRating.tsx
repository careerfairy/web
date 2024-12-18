import { Rating, RatingProps } from "@mui/material"
import { StarIcon } from "components/views/common/icons/StarIcon"
import { styles } from "./styles"

export const FeedbackRating = (props: RatingProps) => {
   return (
      <Rating
         name="module-feedback"
         max={5}
         icon={<StarIcon sx={styles.icon} />}
         emptyIcon={<StarIcon sx={styles.icon} />}
         {...props}
      />
   )
}
