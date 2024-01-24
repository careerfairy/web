import MultiCheckboxSelect from "../MultiCheckboxSelect"
import {
   CompanyIndustryValues,
   RelevantCompanyIndustryValues,
} from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapIdValueFn,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { FC, useCallback } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"
import {
   Box,
   Checkbox,
   Chip,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
} from "@mui/material"
import { Search, XCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
   PaperProps: {
      style: {
         maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
         width: 250,
      },
   },
}

const selectorFilterKey = "companyIndustries"

const styles = sxStyles({
   selectIcon: { px: 2 },
   selectedChipsWrapper: { display: "flex", flexWrap: "wrap", gap: 1 },
   mainForm: { width: "100%", mt: 2 },
   optionsDropdownWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
      label: {
         flexGrow: 1,
      },
   },
})
type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const CompanyIndustrySelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const getSelectedCompanyIndustry = useCallback(() => {
      const queryIndustries = query.companyIndustries as string
      let selectedIndustries = []

      if (queryIndustries) {
         selectedIndustries = formatToOptionArray(
            queryIndustries.split(","),
            CompanyIndustryValues
         )
      }
      return selectedIndustries
   }, [query.companyIndustries])

   const isOptionSelected = (option: OptionGroup): boolean => {
      return (
         getSelectedCompanyIndustry().find(
            (selectedIndustry) => selectedIndustry.id === option.id
         ) !== undefined
      )
   }
   const onDeleteOptionGroup = (optionGroup: OptionGroup): void => {
      console.log("🚀 ~ Select ~ OnDelete  optionGroup: ", optionGroup)
      const updatedIndustries = getSelectedCompanyIndustry().filter(
         (selectedIndustry) => selectedIndustry.id !== optionGroup.id
      )
      console.log(
         "🚀 ~ Select ~ onDelete ~ updatedIndustries:",
         updatedIndustries
      )
      handleChange(selectorFilterKey, updatedIndustries)
   }
   const onSelectOptionGroup = (selectedOption) => {
      console.log(
         "🚀 ~ CompanyIndustrySelector ~ selectedOption:",
         selectedOption
      )
      const selectedIndustryOptions = formatToOptionArray(
         selectedOption.map(multiListSelectMapIdValueFn),
         CompanyIndustryValues
      )
      console.log(
         "🚀 ~ selectedIndustryOptions ~ selectedIndustryOptions:",
         selectedIndustryOptions
      )

      handleChange(selectorFilterKey, selectedIndustryOptions)
   }
   return (
      <>
         <MultiCheckboxSelect
            inputName={selectorFilterKey}
            selectedItems={getSelectedCompanyIndustry()}
            allValues={RelevantCompanyIndustryValues}
            setFieldValue={handleChange}
            getValueFn={multiListSelectMapValueFn}
         />
         <FormControl sx={styles.mainForm}>
            <InputLabel id="chip-label">Search industry</InputLabel>
            <Select
               labelId="chip-label"
               multiple
               value={getSelectedCompanyIndustry()}
               label="Search industry"
               placeholder="Search industry"
               onChange={(e) => {
                  onSelectOptionGroup(
                     e.target.value as unknown as OptionGroup[]
                  )
               }}
               IconComponent={() => (
                  <Box sx={styles.selectIcon}>
                     <Search></Search>
                  </Box>
               )}
               renderValue={(selected) => (
                  <Box sx={styles.selectedChipsWrapper}>
                     <CompanyIndustryOptionChip
                        items={selected}
                        onDelete={onDeleteOptionGroup}
                     />
                  </Box>
               )}
               MenuProps={MenuProps}
            >
               {CompanyIndustryValues.map((companyIndustry) => (
                  //@ts-ignore - necessary to load object into value
                  <MenuItem key={companyIndustry.id} value={companyIndustry}>
                     <Box sx={styles.optionsDropdownWrapper}>
                        <span style={styles.optionsDropdownWrapper.label}>
                           {companyIndustry.name}
                        </span>
                        <Checkbox
                           checked={isOptionSelected(companyIndustry)}
                           onChange={(e) => {
                              console.log(
                                 "🚀 ~ Checkbox ~ Onchange ~ CompanyIndustrySelector ~ checked:",
                                 e.target.checked
                              )

                              if (e.target.checked)
                                 onSelectOptionGroup(
                                    getSelectedCompanyIndustry().concat(
                                       companyIndustry
                                    )
                                 )
                              else onDeleteOptionGroup(companyIndustry)
                           }}
                        />
                     </Box>
                  </MenuItem>
               ))}
            </Select>
         </FormControl>
      </>
   )
}

type CompanyIndustryChipOptionsProps = {
   items: OptionGroup[]
   onDelete: (optionGroup: OptionGroup) => void
}
const CompanyIndustryOptionChip: FC<CompanyIndustryChipOptionsProps> = ({
   items,
   onDelete,
}) => {
   return items.map((optionGroup) => (
      <Chip
         onMouseDown={(event) => {
            event.stopPropagation()
         }}
         key={optionGroup.id}
         label={optionGroup.name}
         color="primary"
         deleteIcon={<XCircle></XCircle>}
         onDelete={() => {
            console.log(
               "🚀 ~ CompanyIndustryOptionChip ~ OnDelete  optionGroup: ",
               optionGroup
            )
            onDelete(optionGroup)
         }}
      />
   ))
}

export default CompanyIndustrySelector
