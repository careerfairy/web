import { Grid, Tooltip, Typography } from "@mui/material"
import FormGroup from "../FormGroup"
import React, { MutableRefObject, useCallback } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import {
   channelOptionCodes,
   countriesOptionCodes,
} from "@careerfairy/shared-lib/constants/forms"
import {
   multiListSelectMapIdValueFn,
   multiListSelectMapValueFn,
} from "../../signup/utils"
import Section from "components/views/common/Section"
import { useStreamCreationProvider } from "./StreamCreationProvider"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Box from "@mui/material/Box"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import useUniversitiesByCountryCodes from "../../../custom-hook/useUniversities"

type Props = {
   promotionChannelsCodes: OptionGroup[]
   promotionCountriesCodes: OptionGroup[]
   promotionUniversitiesCodes: OptionGroup[]
   setFieldValue: (field, value) => void
   classes: string
   sectionRef: MutableRefObject<HTMLDivElement>
   isPastStream?: boolean
}

const PromotionInfo = ({
   promotionChannelsCodes,
   promotionCountriesCodes,
   promotionUniversitiesCodes,
   setFieldValue,
   classes,
   sectionRef,
   isPastStream = false,
}: Props) => {
   const allUniversities = useUniversitiesByCountryCodes(
      promotionCountriesCodes.map((item) => item.id)
   )
   const { showPromotionInputs, isPromotionInputsDisabled } =
      useStreamCreationProvider()

   const getDisabledValues = useCallback(
      (values: OptionGroup[]) => {
         return isPromotionInputsDisabled ? values.map((item) => item.id) : []
      },
      [isPromotionInputsDisabled]
   )

   return (
      <Section
         sectionRef={sectionRef}
         sectionId={"PromotionSection"}
         className={classes.section}
      >
         <Typography fontWeight="bold" variant="h4">
            Promotion
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Choose promotion options to advertise this event
         </Typography>

         {showPromotionInputs ? (
            <FormGroup container boxShadow={0}>
               <Grid item xs={12}>
                  <MultiListSelect
                     inputName="promotionChannelsCodes"
                     isCheckbox
                     selectedItems={promotionChannelsCodes}
                     allValues={channelOptionCodes}
                     setFieldValue={setFieldValue}
                     inputProps={{
                        label: "Promotion Channels",
                        placeholder:
                           "Select Promotion Channel (Facebook/Instagram/Tik Tok)",
                     }}
                     getValueFn={multiListSelectMapValueFn}
                     chipProps={{
                        color: "secondary",
                     }}
                     checkboxColor="secondary"
                     disabledValues={getDisabledValues(channelOptionCodes)}
                     getDisabledFn={multiListSelectMapIdValueFn}
                     disabled={isPromotionInputsDisabled}
                  />
               </Grid>

               <Grid item xs={12}>
                  <MultiListSelect
                     inputName="promotionCountriesCodes"
                     isCheckbox
                     selectedItems={promotionCountriesCodes}
                     allValues={countriesOptionCodes}
                     setFieldValue={setFieldValue}
                     inputProps={{
                        label: "Countries for Promotion",
                        placeholder:
                           "Select Countries in which promotion is desired",
                     }}
                     getValueFn={multiListSelectMapValueFn}
                     chipProps={{
                        color: "secondary",
                     }}
                     checkboxColor="secondary"
                     disabledValues={getDisabledValues(countriesOptionCodes)}
                     getDisabledFn={multiListSelectMapIdValueFn}
                     disabled={isPromotionInputsDisabled}
                  />
               </Grid>

               <Tooltip
                  placement="bottom"
                  arrow
                  title={
                     <Typography>
                        Please first select the countries in which you would
                        like to promote your event.
                     </Typography>
                  }
                  disableHoverListener={Boolean(
                     promotionCountriesCodes?.length ||
                        isPromotionInputsDisabled
                  )}
               >
                  <Grid item xs={12}>
                     <MultiListSelect
                        inputName="promotionUniversitiesCodes"
                        isCheckbox
                        selectedItems={promotionUniversitiesCodes}
                        allValues={allUniversities}
                        setFieldValue={setFieldValue}
                        inputProps={{
                           label: "Universities for Promotion",
                           placeholder:
                              "Select Universities in which promotion is desired",
                        }}
                        getValueFn={multiListSelectMapValueFn}
                        chipProps={{
                           color: "secondary",
                        }}
                        checkboxColor="secondary"
                        disabledValues={getDisabledValues(allUniversities)}
                        getDisabledFn={multiListSelectMapIdValueFn}
                        disabled={
                           isPromotionInputsDisabled ||
                           promotionCountriesCodes?.length === 0
                        }
                     />
                  </Grid>
               </Tooltip>
            </FormGroup>
         ) : (
            <Box
               display="flex"
               mt={3}
               mb={10}
               alignItems={{ xs: "center", md: "end" }}
            >
               <InfoOutlinedIcon color="secondary" fontSize="large" />
               <Typography variant="h5" ml={2}>
                  {isPastStream
                     ? "No promotion options were selected for this event."
                     : "CareerFairy cannot promote your event if it is scheduled less than 30 days in the future"}
               </Typography>
            </Box>
         )}
      </Section>
   )
}

export default PromotionInfo
