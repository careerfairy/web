import { Grid, Typography } from "@mui/material"
import FormGroup from "../FormGroup"
import MultiListSelect from "../../common/MultiListSelect"
import React from "react"
import { Interest } from "@careerfairy/shared-lib/dist/interests"

type Props = {
   setSelectedInterests: React.Dispatch<React.SetStateAction<Interest[]>>
   selectedInterests: Interest[]
   existingInterests: Interest[]
   isSubmitting: boolean
   setFieldValue: (field, value) => void
}

const EventCategoriesInfo = ({
   setSelectedInterests,
   selectedInterests,
   existingInterests,
   isSubmitting,
   setFieldValue,
}: Props) => {
   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Event Categories
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Add categories that related to this event
         </Typography>
         <FormGroup container boxShadow={0}>
            <Grid xs={12} item>
               <MultiListSelect
                  inputName="interestsIds"
                  onSelectItems={setSelectedInterests}
                  selectedItems={selectedInterests}
                  allValues={existingInterests}
                  disabled={isSubmitting}
                  limit={5}
                  setFieldValue={setFieldValue}
                  inputProps={{
                     label: "Add some Categories",
                     placeholder:
                        "Choose 5 categories that best describe this event",
                  }}
                  chipProps={{
                     variant: "contained",
                     color: "secondary",
                  }}
                  isCheckbox={true}
               />
            </Grid>
         </FormGroup>
      </>
   )
}
export default EventCategoriesInfo
