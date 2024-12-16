import { UserData } from "@careerfairy/shared-lib/users"
import { Stack } from "@mui/material"
import useCountriesList from "components/custom-hook/countries/useCountriesList"
import useCountryCities from "components/custom-hook/countries/useCountryCities"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { ReactNode, useEffect } from "react"
import { FormProvider, UseFormReturn, useFormContext } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import {
   PersonalInfoSchema,
   PersonalInfoSchemaType,
   getInitialPersonalInfoValues,
} from "./schemas"

const styles = sxStyles({
   formRoot: {
      // No styles for now
   },
})

type PersonalInfoFormProviderProps = {
   userData?: UserData
   children:
      | ((methods: UseFormReturn<PersonalInfoSchemaType>) => ReactNode)
      | ReactNode
}

export const PersonalInfoFormProvider = ({
   children,
   userData,
}: PersonalInfoFormProviderProps) => {
   const defaultValues = getInitialPersonalInfoValues(userData)

   const methods = useYupForm({
      schema: PersonalInfoSchema,
      defaultValues: defaultValues,
      mode: "onChange",
      reValidateMode: "onChange",
   })

   // Explicitly reset form values after initialization if they change
   useEffect(() => {
      methods.reset(defaultValues)
      return () => {
         methods.reset({})
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData])

   return (
      <FormProvider {...methods}>
         {typeof children === "function" ? children(methods) : children}
      </FormProvider>
   )
}

export const PersonalInfoFormFields = () => {
   const {
      formState: { isSubmitting },
      watch,
      setValue,
   } = useFormContext<PersonalInfoSchemaType>()

   const countryIsoCode = watch("countryIsoCode")

   const { data: countriesList } = useCountriesList()
   const { data: countryCities } = useCountryCities(countryIsoCode)

   return (
      <Stack spacing={2} sx={styles.formRoot}>
         <ControlledBrandedTextField
            id="firstName"
            name="firstName"
            label="First name"
            placeholder="E.g., John"
            disabled={isSubmitting}
            fullWidth
         />
         <ControlledBrandedTextField
            id="lastName"
            name="lastName"
            label="Last name"
            placeholder="E.g., Doe"
            disabled={isSubmitting}
            fullWidth
         />
         <ControlledBrandedAutoComplete
            label={"Country"}
            name={"countryIsoCode"}
            options={Object.keys(countriesList)}
            textFieldProps={{
               requiredText: "",
               placeholder: "E.g, Switzerland",
               sx: {
                  "& .MuiAutocomplete-inputRoot.Mui-focused": {
                     borderColor: (theme) => theme.brand.purple[300],
                  },
               },
            }}
            autocompleteProps={{
               id: "countryIsoCode",
               disabled: isSubmitting,
               disableClearable: true,
               autoHighlight: true,
               selectOnFocus: false,
               getOptionLabel: (option) =>
                  (option && countriesList[option]?.name) || "",
               isOptionEqualToValue: (option, value) => option === value,
               onChange: () => {
                  setValue("cityIsoCode", "")
               },
            }}
         />

         <ControlledBrandedAutoComplete
            label={"City"}
            name={"cityIsoCode"}
            options={Object.keys(countryCities)}
            textFieldProps={{
               requiredText: "",
               placeholder: "E.g, Zurich",
               sx: {
                  "& .MuiAutocomplete-inputRoot.Mui-focused": {
                     borderColor: (theme) => theme.brand.purple[300],
                  },
               },
            }}
            autocompleteProps={{
               id: "cityIsoCode",
               disabled: isSubmitting,
               disableClearable: true,
               autoHighlight: true,
               selectOnFocus: false,
               getOptionLabel: (option) =>
                  (option && countryCities[option]?.name) || "",
               isOptionEqualToValue: (option, value) => option === value,
            }}
         />
         <ControlledBrandedTextField
            id="email"
            name="email"
            label="Email"
            placeholder="E.g., your@email.com"
            disabled
            fullWidth
            tooltipText="As of now, you can't change your email address."
            sx={{
               "& .MuiAutocomplete-inputRoot": {
                  backgroundColor: (theme) => theme.brand.white[300],
                  opacity: 0.45,
               },
            }}
         />
      </Stack>
   )
}
