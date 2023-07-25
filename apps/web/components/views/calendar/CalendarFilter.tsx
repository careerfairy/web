import React, { useCallback, useMemo } from "react"
import {
   Box,
   DialogContent,
   Divider,
   FormControl,
   Popover,
   PopoverProps,
   TextField,
   Typography,
   alpha,
} from "@mui/material"
import { DialogTitle } from "@mui/material"
import { Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { multiListSelectMapValueFn } from "components/views/signup/utils"
import MultiCheckboxSelect, {
   MultiCheckboxSelectType,
} from "../common/filter/MultiCheckboxSelect"
import MultiListSelect from "../common/MultiListSelect"
import { TimelineUniversity } from "@careerfairy/shared-lib/universities/universityTimeline"
import { useTheme } from "@mui/material"
import { StyledCheckbox } from "../group/admin/common/inputs"
import { styled } from "@mui/material/styles"

type Props = {
   allUniversityOptions: TimelineUniversity[]
   selectedUniversities: OptionGroup[]
   setSelectedUniversities: (options: OptionGroup[]) => void
   selectedCountries: OptionGroup[]
   setSelectedCountries: (options: OptionGroup[]) => void
   universityOptions: OptionGroup[]
   setUniversityOptions: (options: OptionGroup[]) => void
   showTitle?: boolean
   multiCheckboxSelectType?: MultiCheckboxSelectType
   isTextRightOfCheckbox?: boolean
   popoverProps?: PopoverProps
}

const styles = sxStyles({
   container: {
      backgroundColor: "white",
   },
   content: {
      p: { xs: 1, md: 2 },
      minWidth: 200,
   },
   header: {
      px: { xs: 2, md: 4 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
   },
})

const CalendarFilter = ({
   allUniversityOptions, // all universities to be considered
   selectedUniversities,
   setSelectedUniversities,
   selectedCountries,
   setSelectedCountries,
   universityOptions,
   setUniversityOptions,
   showTitle = false,
   multiCheckboxSelectType = "singleColumn", // whether the checklist is shown in a single justified/unjustified column or in two columns
   isTextRightOfCheckbox = false,
   popoverProps, // to add if we want the filter to be a popover
}: Props) => {
   const theme = useTheme()
   const countryOptions = useMemo(() => {
      const uniqueOptions = allUniversityOptions
         ?.filter(
            (uni, index, self) =>
               self.findIndex(
                  (first) => first.countryCode === uni.countryCode
               ) === index
         )
         .sort((uni1, uni2) => uni2.name.localeCompare(uni1.name))
         .map((uni) => {
            const option = {
               id: uni.countryCode,
               name: universityCountriesMap[uni.countryCode],
            }
            return option
         })
      return uniqueOptions ? uniqueOptions : []
   }, [allUniversityOptions])

   const handleChangeFilterCountries = useCallback(
      (selectedOptions: OptionGroup[]) => {
         setSelectedCountries(selectedOptions)
         const countryIds = selectedOptions.map((sel) => sel.id)
         const newOptions = allUniversityOptions
            .filter((uni) => countryIds.includes(uni.countryCode))
            .map((uni) => {
               const option = {
                  id: uni.id,
                  name: uni.name,
                  groupId: uni.countryCode,
               }
               return option
            })
         setUniversityOptions(newOptions)
      },
      [setSelectedCountries, setUniversityOptions, allUniversityOptions]
   )

   const isUniListDisabled = useMemo(
      () => (selectedCountries ? selectedCountries.length <= 0 : true),
      [selectedCountries]
   )

   const uniListValues = useMemo(
      () => (universityOptions ? universityOptions : []),
      [universityOptions]
   )

   const getUniListLabel = useCallback(
      (option) => (
         <Typography>
            {option.name}
            <Typography fontSize={"12px"}>
               {universityCountriesMap[option.groupId]}
            </Typography>
         </Typography>
      ),
      []
   )

   let filterContent = useMemo(
      () => (
         <Box sx={styles.container}>
            {showTitle ? (
               <DialogTitle sx={styles.header}>
                  <Typography fontWeight={600} fontSize={"24px"}>
                     Filters
                  </Typography>
               </DialogTitle>
            ) : null}
            <DialogContent sx={styles.content}>
               <Stack sx={styles.content} spacing={3} divider={<Divider />}>
                  {[
                     <FormControl
                        key={`country-select`}
                        variant={"outlined"}
                        fullWidth
                     >
                        <Stack
                           direction={"row"}
                           justifyContent={"space-between"}
                           alignItems={"center"}
                           spacing={2}
                        ></Stack>
                        <Box id={`country-select`}>
                           <Typography
                              htmlFor={`country-select`}
                              component={"label"}
                              variant={"h6"}
                              fontWeight={600}
                              id={`country-select-label`}
                           >
                              Countries
                           </Typography>
                           <MultiCheckboxSelect
                              key={"country-select-boxes"}
                              inputName={"universityCountries"}
                              selectedItems={selectedCountries}
                              allValues={countryOptions}
                              onSelectItems={handleChangeFilterCountries}
                              getValueFn={multiListSelectMapValueFn}
                              type={multiCheckboxSelectType}
                              useStyledCheckbox={true}
                           />
                        </Box>
                        <Box id={`university-select`} mt={2}>
                           <Box mb={1}>
                              <Typography
                                 htmlFor={`university-select`}
                                 component={"label"}
                                 variant={"h6"}
                                 fontWeight={600}
                                 id={`university-select-label`}
                              >
                                 Universities
                              </Typography>
                           </Box>
                           <MultiListSelect
                              inputName={"universities"}
                              disabled={isUniListDisabled}
                              isCheckbox
                              checkboxColor={"secondary"}
                              selectedItems={selectedUniversities}
                              allValues={uniListValues}
                              onSelectItems={setSelectedUniversities}
                              inputProps={{
                                 placeholder: "Select your target universities",
                              }}
                              getValueFn={multiListSelectMapValueFn}
                              getListLabelFn={getUniListLabel}
                              chipProps={{
                                 color: "secondary",
                              }}
                              isChipUnderTextfield={true}
                              useStyledTextfield={true}
                              useStyledCheckbox={true}
                           />
                        </Box>
                     </FormControl>,
                  ]}
               </Stack>
            </DialogContent>
         </Box>
      ),
      [
         countryOptions,
         getUniListLabel,
         handleChangeFilterCountries,
         isUniListDisabled,
         multiCheckboxSelectType,
         selectedCountries,
         selectedUniversities,
         setSelectedUniversities,
         showTitle,
         uniListValues,
      ]
   )

   if (popoverProps) {
      filterContent = (
         <Popover
            sx={{ zIndex: 3 }}
            PaperProps={{ style: { width: "28%" } }}
            {...popoverProps}
         >
            {filterContent}
         </Popover>
      )
   }

   return filterContent
}

export default CalendarFilter
