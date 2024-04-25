import FormSectionHeader from "../../FormSectionHeader"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "./components/MultiChipSelect"

const FIELD_NAME = "general.categories.values"

const Categories = () => {
   const {
      values: { general },
      setFieldValue,
      validateField,
   } = useLivestreamFormValues()

   const onChangeHandler = async (_, selectedOptions) => {
      await setFieldValue(FIELD_NAME, selectedOptions)
      await validateField(FIELD_NAME)
   }

   return (
      <>
         <FormSectionHeader
            title="Live Stream Categories"
            subtitle="Add categories related to this live stream"
            divider
         />
         <MultiChipSelect
            id={FIELD_NAME}
            value={general.categories.values}
            options={general.categories.options}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Live stream categories",
               placeholder:
                  "Choose 5 categories that best describe this live stream",
               required: true,
            }}
            onChange={onChangeHandler}
            limit={5}
         />
      </>
   )
}

export default Categories
