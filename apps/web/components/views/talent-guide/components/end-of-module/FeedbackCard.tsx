import {
   TAG_CATEGORY,
   TagCategory,
   TalentGuideFeedback,
} from "@careerfairy/shared-lib/talent-guide/types"
import { LoadingButton } from "@mui/lab"
import {
   Box,
   Chip,
   Rating,
   RatingProps,
   Stack,
   Typography,
} from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useCallback, useState } from "react"
import { SetValueConfig } from "react-hook-form"
import FramerBox from "../../../common/FramerBox"
import { AnimatedCollapse } from "../../animations/AnimatedCollapse"
import { ratingTitleAnimation } from "./animations"
import { styles } from "./styles"

import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { StarIcon } from "components/views/common/icons/StarIcon"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { useTalentGuideState } from "store/selectors/talentGuideSelectors"
import { FeedbackFormData, feedbackSchema } from "../../schema"

export const ratingTitles: Record<TalentGuideFeedback["rating"], string> = {
   1: "Big yikes.",
   2: "Kinda meh.",
   3: "Not bad, could be better.",
   4: "Pretty solid!",
   5: "Nailed it!",
}

type Props = {
   onRatingClick: () => void
   preview: boolean
   onFeedbackSubmitted: () => void
}

const tags = Object.values(TAG_CATEGORY)

export const FeedbackCard = ({
   onRatingClick,
   preview,
   onFeedbackSubmitted,
}: Props) => {
   const [hover, setHover] = useState(-1)
   const { moduleData, userAuthUid } = useTalentGuideState()
   const { errorNotification } = useSnackbarNotifications()
   const {
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { isDirty, isValid, isSubmitting },
   } = useYupForm({
      schema: feedbackSchema,
      defaultValues,
   })

   const currentRating = watch("rating")
   const currentTags = watch("tags")

   const onSubmit = async (data: FeedbackFormData) => {
      try {
         await talentGuideProgressService.submitFeedback(
            moduleData.content.id,
            userAuthUid,
            data.rating as TalentGuideFeedback["rating"],
            data.tags as TagCategory[]
         )
         reset()
         onFeedbackSubmitted?.()
      } catch (error) {
         errorNotification(
            error,
            "Unable to submit feedback. Our team has been notified."
         )
      }
   }

   const isSelected = useCallback(
      (tag: TagCategory) => currentTags.includes(tag),
      [currentTags]
   )

   return (
      <Box sx={styles.root} component="form" onSubmit={handleSubmit(onSubmit)}>
         <AnimatedCollapse show={preview}>
            <Typography variant="brandedH5" component="h5" sx={styles.title}>
               How did we do?
            </Typography>
            <Typography variant="medium" component="p" color="text.secondary">
               Rate your experience and let us know how we can improve!
            </Typography>
         </AnimatedCollapse>

         <Stack spacing={1} alignItems="center">
            <AnimatedCollapse show={!preview}>
               <FramerBox
                  {...ratingTitleAnimation}
                  key={hover !== -1 ? hover : currentRating}
               >
                  <Typography
                     sx={styles.ratingTitle}
                     component="p"
                     variant="small"
                  >
                     {ratingTitles[hover !== -1 ? hover : currentRating] || ""}
                  </Typography>
               </FramerBox>
            </AnimatedCollapse>
            <FeedbackRating
               sx={[styles.rating, preview && styles.ratingPreview]}
               onChange={async (_, value) => {
                  if (value !== null && value > 0) {
                     setValue("rating", value, setOptions)
                     onRatingClick?.()
                  }
               }}
               value={currentRating}
               onChangeActive={(_, newHover) => {
                  setHover(newHover)
               }}
            />
         </Stack>
         <AnimatedCollapse show={!preview}>
            <Stack my={3} spacing={1.5}>
               <Typography
                  mt={3}
                  variant="brandedH5"
                  component="h5"
                  sx={styles.title}
               >
                  How did we do?
               </Typography>
               <Box sx={styles.chipsContainer}>
                  {tags.map((tag) => (
                     <Chip
                        key={tag.id}
                        label={tag.label.en}
                        sx={[
                           styles.chip,
                           isSelected(tag.id)
                              ? styles.selectedChip
                              : styles.unselectedChip,
                        ]}
                        onClick={async () => {
                           if (isSelected(tag.id)) {
                              setValue(
                                 "tags",
                                 currentTags.filter((t) => t !== tag.id),
                                 setOptions
                              )
                           } else {
                              setValue(
                                 "tags",
                                 [...currentTags, tag.id],
                                 setOptions
                              )
                           }
                        }}
                        color={isSelected(tag.id) ? "primary" : "default"}
                     />
                  ))}
               </Box>
            </Stack>
         </AnimatedCollapse>

         <LoadingButton
            loading={isSubmitting}
            type="submit"
            variant="contained"
            color="primary"
            disabled={preview || !isValid || !isDirty}
            fullWidth
         >
            Continue
         </LoadingButton>
      </Box>
   )
}

const FeedbackRating = (props: RatingProps) => {
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

export const defaultValues = {
   rating: 0,
   tags: [],
}

const setOptions: SetValueConfig = {
   shouldValidate: true,
   shouldDirty: true,
   shouldTouch: true,
}
