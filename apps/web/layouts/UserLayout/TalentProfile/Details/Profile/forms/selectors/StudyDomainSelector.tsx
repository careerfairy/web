import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { SyntheticEvent, useMemo } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
   fieldName: string
   collection: "fieldsOfStudy" | "levelsOfStudy"
   label?: string
   placeholder?: string
   requiredText?: string
   disableInput?: boolean
}

export const StudyDomainSelector = ({
   fieldName,
   collection,
   label,
   placeholder,
   requiredText,
   disableInput,
}: Props) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>(collection)

   const {
      formState: { isSubmitting },
      setValue,
   } = useFormContext()

   const options = useMemo(
      () =>
         fieldsOfStudy?.map((fieldOfStudy) => ({
            id: fieldOfStudy.id,
            value: fieldOfStudy.name,
         })) || [],
      [fieldsOfStudy]
   )

   const onChangeHandler = (
      _: SyntheticEvent,
      option: { id: string; value: string }
   ) => {
      setValue(fieldName, option ? { ...option, name: option.value } : option, {
         shouldValidate: true,
      })
   }

   return (
      <ControlledBrandedAutoComplete
         label={label}
         name={fieldName}
         options={options}
         textFieldProps={{
            requiredText: requiredText,
            placeholder: placeholder,
            inputMode: disableInput ? "none" : "search",
         }}
         autocompleteProps={{
            id: fieldName,
            disabled: isSubmitting,
            disableClearable: false,
            autoHighlight: true,
            getOptionLabel: (option: { id: string; value: string }) =>
               option.value || "",
            onChange: onChangeHandler,
         }}
      />
   )
}

type FieldsOfStudySelectorProps = {
   fieldName: string
}

export const FieldsOfStudySelector = ({
   fieldName,
}: FieldsOfStudySelectorProps) => {
   return (
      <StudyDomainSelector
         collection="fieldsOfStudy"
         fieldName={fieldName}
         placeholder="E.g., Mathematics"
         label="Field of study"
         requiredText="(required)"
      />
   )
}

type LevelsOfStudySelectorProps = {
   fieldName: string
}

export const LevelsOfStudySelector = ({
   fieldName,
}: LevelsOfStudySelectorProps) => {
   return (
      <StudyDomainSelector
         collection="levelsOfStudy"
         fieldName={fieldName}
         placeholder="E.g., Bachelor's"
         label="Degree"
         requiredText="(required)"
         disableInput
      />
   )
}
