import { Grid } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"
import MultiChipSelect from "../../general/components/MultiChipSelect"
import { ESTIMATED_DURATIONS } from "../commons"

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

enum FeedbackQuestionTypes {
   STAR,
   NUMBER,
   SENTIMENT,
   TEXT,
   BINARY,
}

const QUESTION_TYPES = [
   {
      id: FeedbackQuestionTypes.STAR,
      name: "Star rating",
   },
   {
      id: FeedbackQuestionTypes.NUMBER,
      name: "Number rating",
   },
   {
      id: FeedbackQuestionTypes.SENTIMENT,
      name: "Sentiment rating",
   },
   {
      id: FeedbackQuestionTypes.TEXT,
      name: "Written review",
   },
   {
      id: FeedbackQuestionTypes.BINARY,
      name: "Yes or No",
   },
] as const

const FeedbackQuestionForm = () => (
   <Grid container spacing={2} sx={styles.mobileHelper}>
      <Grid xs={12} item>
         <FormBrandedTextField
            name="title"
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
            value={undefined}
            keyOptionIndexer="id"
            textFieldProps={{
               label: "Question Type",
               placeholder: "Choose the question type",
               required: true,
            }}
         />
      </Grid>
      <Grid xs={12} md={6} item>
         <MultiChipSelect
            id="appearAfter"
            options={ESTIMATED_DURATIONS}
            value={undefined}
            keyOptionIndexer="minutes"
            textFieldProps={{
               label: "Appear After",
               placeholder: "When is it appearing?",
               required: true,
            }}
         />
      </Grid>
   </Grid>
)

export default FeedbackQuestionForm
