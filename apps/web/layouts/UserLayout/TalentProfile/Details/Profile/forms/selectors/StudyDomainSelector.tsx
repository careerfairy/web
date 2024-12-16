import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { MenuItem, Typography } from "@mui/material"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { SyntheticEvent, useMemo } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
   fieldName: string
   collection: "fieldsOfStudy" | "levelsOfStudy"
   label?: string
   placeholder?: string
   requiredText?: string
   useTextField?: boolean
}

export const StudyDomainSelector = ({
   fieldName,
   collection,
   label,
   placeholder,
   requiredText,
   useTextField,
}: Props) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>(collection)

   const {
      formState: { isSubmitting },
      setValue,
      watch,
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

   const value = watch(fieldName)

   if (useTextField) {
      return (
         <BrandedTextField
            select
            label={label}
            name={fieldName}
            SelectProps={{
               displayEmpty: true,
               MenuProps: {
                  sx: {
                     "& .MuiMenu-paper": {
                        boxShadow: "0px 7px 4px -9px rgba(0,0,0,0.8)",
                        filter: "none",
                        border: "0.5px solid #E0E0E0",
                        borderRadius: "4px",
                        transition: "none",
                     },
                  },
                  TransitionProps: {
                     enter: false,
                     exit: false,
                  },
                  transitionDuration: 0,
               },
               renderValue: (value: { id: string; value: string }) => {
                  return value?.value ? (
                     value.value
                  ) : (
                     <Typography color={"neutral.400"}>
                        {placeholder}
                     </Typography>
                  )
               },
            }}
            disabled={isSubmitting}
            fullWidth
            value={value}
            requiredText={requiredText}
         >
            {options.map((option) => (
               <MenuItem
                  key={option.id}
                  value={option.id}
                  onClick={() => {
                     onChangeHandler(null, option)
                  }}
               >
                  {option.value}
               </MenuItem>
            ))}
         </BrandedTextField>
      )
   }

   return (
      <ControlledBrandedAutoComplete
         label={label}
         name={fieldName}
         options={options}
         textFieldProps={{
            requiredText: requiredText,
            placeholder: placeholder,
         }}
         autocompleteProps={{
            id: fieldName,
            disabled: isSubmitting,
            disableClearable: false,
            autoHighlight: true,
            selectOnFocus: false,
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
         useTextField
      />
   )
}
