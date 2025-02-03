import { Box, Stack, Typography } from "@mui/material"
import useUniversitiesByCountryCodes from "components/custom-hook/useUniversities"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { SyntheticEvent, useMemo, useState } from "react"
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
         md: "670px !important",
      },
      ml: {
         xs: -3,
         sm: -3,
         md: -0.2,
      },
      borderRadius: "8px",
      my: 1.5,
      boxShadow: {
         sm: "none",
         md: "0px 4px 16px rgba(0, 0, 0, 0.08)",
      },
   },
   dropdownPaper: {
      // width: "100dvw !important",
      // backgroundColor: (theme) => theme.brand.white[50],
      // pt: "85px",
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
      backgroundColor: (theme) => `${theme.brand.white[50]} !important`,
      "&:hover": {
         backgroundColor: (theme) => `${theme.brand.black[100]} !important`,
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
   const [isFocused, setIsFocused] = useState(false)
   const {
      formState: { isSubmitting },
      setValue,
   } = useFormContext()

   const selectedCountryCode = useWatch({
      name: countryCodeFieldName,
   })

   const universityId = useWatch({
      name: name,
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
      event: SyntheticEvent,
      option: { id: string; value: string }
   ) => {
      setValue(name, option?.id, { shouldValidate: true })
      setIsFocused(false)
      // const target = event.target as HTMLElement
      // target.blur()

      const inputElement = document.querySelector(
         "#selectUniversity"
      ) as HTMLElement
      if (inputElement) {
         inputElement.blur()
      }
   }

   return (
      <ControlledBrandedAutoComplete
         label={label}
         name={name}
         options={options}
         textFieldProps={{
            requiredText: "(required)",
            placeholder: universityId ? "" : placeholder,
            InputProps: {
               startAdornment: (() => {
                  const selectedValue = options.find(
                     (opt) => opt.id === universityId
                  )
                  if (!selectedValue || isFocused) return null
                  return (
                     <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                           pt: "4px",
                           pb: "8px",
                           "&.MuiInputAdornment-root": {
                              display: { xs: "none", md: "flex" },
                              ".Mui-focused &": { display: "none" },
                           },
                           "& .MuiTypography-root": {
                              fontSize: "12px",
                              lineHeight: "16px",
                              fontWeight: 400,
                              color: "#525252",
                           },
                        }}
                     >
                        <SchoolIcon
                           sx={[
                              styles.schoolIcon,
                              {
                                 width: "28px",
                                 height: "28px",
                                 padding: "3.5px 4.083px 3.5px 3.5px",
                              },
                           ]}
                        />
                        <Typography
                           variant="medium"
                           sx={{
                              fontSize: "16px !important",
                              fontWeight: "400 !important",
                              color: (theme) =>
                                 `${theme.palette.neutral[900]} !important`,
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: {
                                 xs: "200px",
                                 sm: "310px",
                                 md: "580px",
                              },
                           }}
                        >
                           {selectedValue.value}
                        </Typography>
                     </Stack>
                  )
               })(),
            },
            sx: [
               !isFocused
                  ? {
                       "& input": {
                          width: 0,
                          p: 0,
                          "&:focus": {
                             width: "100%",
                             p: "16.5px 14px",
                          },
                       },
                    }
                  : null,
            ],
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
               // height: "72px !important",
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
            onFocus: () => {
               setIsFocused(true)
            },
            onBlur: () => setIsFocused(false),
            openOnFocus: true,
            renderOption: (props, option, { selected }) => {
               return getOptionEl(props, option, selectedCountryCode, selected)
            },
            ListboxProps: {
               sx: styles.listBox,
            },
            getOptionLabel: (option: { id: string; value: string }) => {
               if (!isFocused) return ""
               const optionId = typeof option === "string" ? option : option.id

               return universitiesMap[optionId] || ""
            },
            isOptionEqualToValue: (option, value) => {
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
