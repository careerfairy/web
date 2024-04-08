import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { Stack } from "@mui/material"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   form: {
      width: "100%",
   },
})

type Props = {
   poll?: LivestreamPoll | null
}

// const createOrEditPollSchema = basePollSchema.concat(
//    yup.object({
//       question: yup.string().required("Question is required"),
//    })
// )
export const CreateOrEditPollForm = ({ poll }: Props) => {
   console.log("🚀 ~ file: CreateOrEditPollForm.tsx:30 ~ poll:", poll)
   //    const form = useYupForm({
   //       schema: createOrEditPollSchema,
   //    })
   return (
      <Stack sx={styles.form} spacing={3} component="form">
         <ControlledBrandedTextField
            name="question"
            label="Question"
            required
         />
      </Stack>
   )
}
