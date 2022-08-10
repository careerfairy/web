import { Grid, Typography } from "@mui/material"
import React from "react"
import MultiListSelect from "../../common/MultiListSelect"
import FormGroup from "../FormGroup"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"

type Props = {
   currentValues: LivestreamJobAssociation[]
}

const JobSelectorCategory = ({ currentValues }: Props) => {
   return (
      <>
         <Typography style={{ color: "white" }} variant="h4">
            Jobs:
         </Typography>

         <FormGroup>
            <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
               <MultiListSelect
                  inputName="jobId"
                  onSelectItems={(args) => {
                     console.log("onSelectItems", args)
                  }}
                  selectedItems={currentValues}
                  allValues={[
                     {
                        name: "Test",
                        id: "1",
                     },
                     {
                        name: "Test 2",
                        id: "2",
                     },
                  ]}
                  disabled={false}
                  limit={5}
                  setFieldValue={(args) => {
                     console.log("setFieldValue", args)
                  }}
                  inputProps={{
                     label: "Select a job",
                     placeholder: "placeholder select a job",
                  }}
                  chipProps={{
                     variant: "outlined",
                  }}
               />
            </Grid>
         </FormGroup>
      </>
   )
}

export default JobSelectorCategory
