import { Box, Stack, Typography } from "@mui/material"
import useUniversitiesByCountryCodes from "components/custom-hook/useUniversities"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { SyntheticEvent, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import { SchoolIcon } from "../common/icons/SchoolIcon"
import { ControlledBrandedAutoComplete } from "../common/inputs/ControlledBrandedAutoComplete"

const styles = sxStyles({
   listBox: {
      py: 0,
      maxHeight: {
         xs: "100dvh",
         sm: "100dvh",
         md: "228px",
      },
      width: {
         xs: "100dvw !important",
         sm: "100dvw !important",
         md: "auto",
      },
      borderRadius: "8px",
      my: 1.5,
      boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
   },
   dropdownPaper: {
      backgroundColor: (theme) => theme.brand.white[50],
      // "&:hover": {
      //    backgroundColor: (theme) => theme.brand.black[100],
      // },
   },
   schoolIcon: {
      width: "40px",
      height: "40px",
      padding: "5px 5.833px 5px 5px",
      borderRadius: "70px",
      color: (theme) => theme.palette.neutral[200],
      backgroundColor: (theme) => theme.palette.neutral[50],
   },
   universityOptionRoot: {
      backgroundColor: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.black[100],
      },
   },
   selectedUniversityOption: {
      backgroundColor: (theme) => `${theme.brand.white[300]} !important`,
   },
   universityOption: {
      py: "12px",
   },
   universityOptionName: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[800],
   },
   universityOptionCountry: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[500],
   },
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
      formState: { isSubmitting },
      setValue,
   } = useFormContext()

   const selectedCountryCode = useWatch({
      name: countryCodeFieldName,
   })

   const countryCode = useMemo(() => {
      return [selectedCountryCode]
   }, [selectedCountryCode])

   const universities = useUniversitiesByCountryCodes(countryCode)

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
            disabled:
               isSubmitting ||
               !selectedCountryCode ||
               universityCountriesMap[selectedCountryCode] === "None",
            autoHighlight: true,
            disableClearable: false,
            PaperComponent: ({ children }) => (
               <Box sx={styles.dropdownPaper}>{children}</Box>
            ),
            sx: {
               ".Mui-disabled": {
                  backgroundColor: "#F7F8FC",
                  borderColor: (theme) => theme.brand.purple[50],
                  opacity: 0.5,
                  "&:hover": {
                     backgroundColor: "#F7F8FC",
                     borderColor: (theme) =>
                        `${theme.brand.purple[50]} !important`,

                     cursor: "not-allowed",
                  },
               },
               ".MuiFormHelperText-root.Mui-disabled": {
                  backgroundColor: "unset",
               },
            },
            selectOnFocus: false,
            renderOption: (props, option, { selected }) => {
               return getOptionEl(props, option, selectedCountryCode, selected)
            },
            ListboxProps: {
               sx: styles.listBox,
            },
            getOptionLabel: (option: { id: string; value: string }) => {
               const optionId = typeof option === "string" ? option : option.id
               return universitiesMap[optionId] || ""
            },
            isOptionEqualToValue: (option, value) => {
               console.log("🚀 ~ value:", value)
               console.log("🚀 ~ option:", option)
               const optionValue = value as any as string
               return option.id == optionValue
            },
            onChange: onChangeHandler,
         }}
      />
   )
}

const getOptionEl = (
   props: React.HTMLAttributes<HTMLLIElement>,
   option: { id: string; value: string },
   selectedCountryCode: string,
   selected?: boolean
) => (
   <Box
      component="li"
      {...props}
      key={option.id}
      sx={[
         styles.universityOptionRoot,
         selected ? styles.selectedUniversityOption : null,
      ]}
   >
      <Stack direction="row" spacing={1} sx={styles.universityOption}>
         <SchoolIcon sx={styles.schoolIcon} />
         <Stack>
            <Typography variant="small" sx={styles.universityOptionName}>
               {option.value}
            </Typography>
            <Typography variant="xsmall" sx={styles.universityOptionCountry}>
               {universityCountriesMap[selectedCountryCode]}
            </Typography>
         </Stack>
      </Stack>
   </Box>
)

export default SelectUniversitiesDropDown
