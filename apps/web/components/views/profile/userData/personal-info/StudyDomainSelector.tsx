import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"

type Props = {
   name: string
   collection: "fieldsOfStudy" | "levelsOfStudy"
}

export const StudyDomainSelector = ({ name, collection }: Props) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>(collection)

   const {
      formState: { isSubmitting },
   } = useFormContext()

   const options = useMemo(
      () =>
         fieldsOfStudy?.map((fieldOfStudy) => ({
            id: fieldOfStudy.id,
            value: fieldOfStudy.name,
         })) || [],
      [fieldsOfStudy]
   )

   return (
      <ControlledBrandedAutoComplete
         label="Select Field of Study"
         name={name}
         options={options}
         autocompleteProps={{
            placeholder: "Select from the following list",
            id: name,
            disabled: isSubmitting,
            disableClearable: true,
            autoHighlight: true,
         }}
      />
   )
}
