import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { Stack } from "@mui/material"
import FormSectionHeader from "../../FormSectionHeader"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "./components/MultiChipSelect"

const CONTENT_TOPICS_TAGS_FIELD_NAME = "general.contentTopicsTagIds"
const BUSINESS_FUNCTIONS_TAGS_FIELD_NAME = "general.businessFunctionsTagIds"

const Categories = () => {
   const {
      values: { general },

      setFieldValue,
      validateField,
   } = useLivestreamFormValues()

   const onChangeHandlerContentTopics = async (_, selectedOptions) => {
      await setFieldValue(CONTENT_TOPICS_TAGS_FIELD_NAME, selectedOptions)
      await validateField(CONTENT_TOPICS_TAGS_FIELD_NAME)
   }

   const onChangeHandlerBusinessFunctions = async (_, selectedOptions) => {
      await setFieldValue(BUSINESS_FUNCTIONS_TAGS_FIELD_NAME, selectedOptions)
      await validateField(BUSINESS_FUNCTIONS_TAGS_FIELD_NAME)
   }

   return (
      <>
         <FormSectionHeader
            title="Live Stream Categories"
            subtitle="Add categories related to this live stream"
            divider
         />
         <Stack spacing={2}>
            <MultiChipSelect
               id={CONTENT_TOPICS_TAGS_FIELD_NAME}
               value={general.contentTopicsTagIds}
               options={ContentTopicsTagValues}
               multiple
               disableCloseOnSelect
               textFieldProps={{
                  label: "Live stream content topics",
                  placeholder:
                     "Choose at least 1 topic describing the content of the live stream",
                  required: true,
               }}
               onChange={onChangeHandlerContentTopics}
            />
            <MultiChipSelect
               id={BUSINESS_FUNCTIONS_TAGS_FIELD_NAME}
               value={general.businessFunctionsTagIds}
               options={BusinessFunctionsTagValues}
               multiple
               disableCloseOnSelect
               textFieldProps={{
                  label: "Presented business functions",
                  placeholder:
                     "Choose at least 1 business function presented in this live stream",
                  required: true,
               }}
               onChange={onChangeHandlerBusinessFunctions}
            />
         </Stack>
      </>
   )
}

export default Categories
