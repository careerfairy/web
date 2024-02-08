import { useFormikContext } from "formik"
import { LivestreamFormValues } from "../../types"
import FormSectionHeader from "../../FormSectionHeader"
import MultiChipSelect from "./components/MultiChipSelect"
import { useInterests } from "components/custom-hook/useCollection"

const Categories = () => {
   const {
      values: { general },
   } = useFormikContext<LivestreamFormValues>()
   const { data: existingInterests } = useInterests()

   return (
      <>
         <FormSectionHeader
            title="Live Stream Categories"
            subtitle="Add categories related to this live stream"
            divider
         />
         <MultiChipSelect
            id="general.categories"
            options={existingInterests}
            value={general.categories ?? []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Live stream categories",
               placeholder:
                  "Choose 5 categories that best describe this live stream",
               required: true,
            }}
         />
      </>
   )
}

export default Categories
