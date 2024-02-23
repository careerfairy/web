import { Grid } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"

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
         <FormBrandedTextField
            name="type"
            label="Question Type"
            placeholder="Choose the question type"
            fullWidth
            requiredText="(required)"
         />
      </Grid>
      <Grid xs={12} md={6} item>
         <FormBrandedTextField
            name="appearAfter"
            label="Appear After"
            placeholder="When is it appearing?"
            fullWidth
            requiredText="(required)"
         />
      </Grid>
   </Grid>
)

export default FeedbackQuestionForm
