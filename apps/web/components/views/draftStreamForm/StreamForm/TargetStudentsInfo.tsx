import { Grid, Typography } from "@mui/material"
import FormGroup from "../FormGroup"
import FieldsOfStudyMultiSelector from "../TargetFieldsOfStudy/FieldsOfStudyMultiSelector"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import LevelsOfStudyMultiSelector from "../TargetFieldsOfStudy/LevelsOfStudyMultiSelector"

type Props = {
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: FieldOfStudy[]
   setFieldValue: (field, value) => void
}

const TargetStudentsInfo = ({
   targetFieldsOfStudy,
   targetLevelsOfStudy,
   setFieldValue,
}: Props) => {
   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Target Students
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Select target audience for this event
         </Typography>

         <FormGroup container boxShadow={0}>
            <Grid xs={12} item>
               <FieldsOfStudyMultiSelector
                  selectedItems={targetFieldsOfStudy}
                  setFieldValue={setFieldValue}
               />
            </Grid>

            <Grid xs={12} item>
               <LevelsOfStudyMultiSelector
                  selectedItems={targetLevelsOfStudy}
                  setFieldValue={setFieldValue}
               />
            </Grid>
         </FormGroup>
      </>
   )
}

export default TargetStudentsInfo
