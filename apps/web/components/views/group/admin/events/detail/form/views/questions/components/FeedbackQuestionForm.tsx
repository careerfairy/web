import { sxStyles } from "@careerfairy/shared-ui"
import { Grid } from "@mui/material"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import { ESTIMATED_DURATIONS } from "../../../commons"
import MultiChipSelect from "../../general/components/MultiChipSelect"
import {
   FeedbackQuestionFormValues,
   FeedbackQuestionType,
   FeedbackQuestionsLabels,
} from "../commons"

const styles = sxStyles({
   mobileHelper: {
      ".MuiFormHelperText-root": {
         fontSize: {
            xs: "12px",
            md: "14px",
         },
      },
   },
})

const QUESTION_TYPES = [
   {
      id: FeedbackQuestionType.STAR_RATING,
      name: FeedbackQuestionsLabels[FeedbackQuestionType.STAR_RATING],
   },
   {
      id: FeedbackQuestionType.SENTIMENT_RATING,
      name: FeedbackQuestionsLabels[FeedbackQuestionType.SENTIMENT_RATING],
   },
   {
      id: FeedbackQuestionType.TEXT,
      name: FeedbackQuestionsLabels[FeedbackQuestionType.TEXT],
   },
   {
      id: FeedbackQuestionType.TEXT_WITH_RATING,
      name: FeedbackQuestionsLabels[FeedbackQuestionType.TEXT_WITH_RATING],
   },
] as const

type FeedbackQuestionFormProps = {
   questionFormValues: FeedbackQuestionFormValues
}

const FeedbackQuestionForm = ({
   questionFormValues,
}: FeedbackQuestionFormProps) => {
   const typeInitialValue = QUESTION_TYPES.find(
      (type) => type.id === questionFormValues?.type
   )
   const appearAfterInitialValue = ESTIMATED_DURATIONS.find(
      (duration) => duration.minutes === questionFormValues?.appearAfter
   )

   return (
      <Grid container spacing={2} sx={styles.mobileHelper}>
         <Grid xs={12} item>
            <FormBrandedTextField
               name="question"
               label="Question"
               placeholder="Insert the question you want your audience to answer"
               fullWidth
               requiredText="(required)"
            />
         </Grid>
         <Grid xs={12} md={6} item>
            <MultiChipSelect
               id="type"
               options={QUESTION_TYPES}
               value={typeInitialValue}
               keyOptionIndexer="id"
               textFieldProps={{
                  label: "Question type",
                  placeholder: "Choose the question type",
                  required: true,
               }}
            />
         </Grid>
         <Grid xs={12} md={6} item>
            <MultiChipSelect
               id="appearAfter"
               value={appearAfterInitialValue}
               options={ESTIMATED_DURATIONS}
               keyOptionIndexer="minutes"
               textFieldProps={{
                  label: "Appear after",
                  placeholder: "When is it appearing?",
                  required: true,
               }}
            />
         </Grid>
      </Grid>
   )
}

export default FeedbackQuestionForm
