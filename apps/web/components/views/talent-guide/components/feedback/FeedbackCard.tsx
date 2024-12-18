import {
   TAG_CATEGORY,
   TalentGuideFeedback,
} from "@careerfairy/shared-lib/talent-guide/types"
import { LoadingButton } from "@mui/lab"
import { Box, Chip, Stack, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useState } from "react"
import { SetValueConfig } from "react-hook-form"
import FramerBox from "../../../common/FramerBox"
import { AnimatedCollapse } from "./AnimatedCollapse"
import { ratingTitleAnimation } from "./animations"
import { FeedbackRating } from "./FeedbackRating"
import { styles } from "./styles"

import * as yup from "yup"

export const tags = Object.values(TAG_CATEGORY)

export const ratingTitles: Record<TalentGuideFeedback["rating"], string> = {
   1: "Big yikes.",
   2: "Kinda meh.",
   3: "Not bad, could be better.",
   4: "Pretty solid!",
   5: "Nailed it!",
}

export const feedbackSchema = yup.object({
   rating: yup.number().min(1).max(5).required("Please provide a rating"),
   tags: yup
      .array()
      .of(yup.string().oneOf(Object.values(TAG_CATEGORY)))
      .min(1, "Please select at least one tag")
      .required(),
})

export type FeedbackFormData = yup.InferType<typeof feedbackSchema>

export const defaultValues = {
   rating: 0,
   tags: [],
}

const setOptions: SetValueConfig = {
   shouldValidate: true,
   shouldDirty: true,
   shouldTouch: true,
}

type Props = {
   onRatingClick: () => void
   preview: boolean
}

export const FeedbackCard = ({ onRatingClick, preview }: Props) => {
   const [hover, setHover] = useState(-1)

   const {
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { isDirty, isValid, isSubmitting },
   } = useYupForm({
      schema: feedbackSchema,
      defaultValues,
      shouldUnregister: false,
   })

   const currentRating = watch("rating")
   const currentTags = watch("tags")

   const onSubmit = (data: FeedbackFormData) => {
      console.log("Form submitted:", data)
      reset()
   }

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
                        key={tag}
                        className="stacked"
                        label={tag}
                        onClick={async () => {
                           if (currentTags.includes(tag)) {
                              setValue(
                                 "tags",
                                 currentTags.filter((t) => t !== tag),
                                 setOptions
                              )
                           } else {
                              setValue(
                                 "tags",
                                 [...currentTags, tag],
                                 setOptions
                              )
                           }
                        }}
                        color={
                           currentTags.includes(tag) ? "primary" : "default"
                        }
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
