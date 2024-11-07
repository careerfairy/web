import { Box, Stack, Typography } from "@mui/material"
import useUniversitiesByCountryCodes from "components/custom-hook/useUniversities"
import { SyntheticEvent, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { SchoolIcon } from "../common/icons/SchoolIcon"
import { ControlledBrandedAutoComplete } from "../common/inputs/ControlledBrandedAutoComplete"

const styles = sxStyles({
   listBox: {
      py: 0,
   },
   schoolIcon: {},
})

type Props = {
   name: string
   label: string
   placeholder: string
   countryCodeFieldName: string
}

const SelectUniversitiesDropDown = ({
   name,
   label,
   placeholder,
   countryCodeFieldName,
}: Props) => {
   const {
      formState: { isSubmitting, errors },
      setValue,
   } = useFormContext()

   console.log("🚀 ~ errors:", errors)

   const selectedCountryCode = useWatch({
      name: countryCodeFieldName,
   })

   const selectedUni = useWatch({
      name: name,
   })
   console.log("🚀 ~ selectedUni:", selectedUni)

   const countryCodes = useMemo(() => {
      return [selectedCountryCode]
   }, [selectedCountryCode])

   const universities = useUniversitiesByCountryCodes(countryCodes)

   const options = useMemo(() => {
      return (
         universities?.map((university) => ({
            id: university.id,
            value: university.name,
         })) || []
      )
   }, [universities])

   const universitiesMap = useMemo(() => {
      return options.reduce((obj, item) => {
         obj[item.id] = item.value
         return obj
      }, {} as Record<string, string>)
   }, [options])

   const onChangeHandler = (
      _: SyntheticEvent,
      option: { id: string; value: string }
   ) => {
      setValue(name, option?.id, { shouldValidate: true })
   }

   return (
      <ControlledBrandedAutoComplete
         label={label}
         name={name}
         options={options}
         textFieldProps={{
            requiredText: "(required)",
            placeholder: placeholder,
         }}
         autocompleteProps={{
            id: "selectUniversity",
            disabled: isSubmitting,
            autoHighlight: true,
            disableClearable: false,
            renderOption: (props, option) => {
               return getOptionEl(props, option)
            },
            ListboxProps: {
               sx: styles.listBox,
            },
            getOptionLabel: (option: string) =>
               getLabelFunction(option, universitiesMap),
            isOptionEqualToValue: (option, value) => option.id == value,
            onChange: onChangeHandler,
         }}
      />
   )
}

const getOptionEl = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: { id: string; value: string }
) => (
   <li {...props} key={option.id}>
      <Stack direction="row" py={0}>
         <Box>
            <SchoolIcon sx={styles.schoolIcon} />
         </Box>
         <Stack>
            <Typography>{option.value}</Typography>
            <Typography>{option.id}</Typography>
         </Stack>
      </Stack>
   </li>
)

const getLabelFunction = (
   option: string,
   universitiesMap: Record<string, string>
) => universitiesMap[option] || ""

export default SelectUniversitiesDropDown
