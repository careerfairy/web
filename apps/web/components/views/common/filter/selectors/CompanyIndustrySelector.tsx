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
                  console.log(
                     "🚀 ~ CompanyIndustrySelector ~ value:",
                     e.target.value
                  )
                  const selectedOption = e.target
                     .value as unknown as OptionGroup[]
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
                        onDelete={(optionGroup) => {
                           console.log(
                              "🚀 ~ Select ~ OnDelete  optionGroup: ",
                              optionGroup
                           )
                           const updatedIndustries =
                              getSelectedCompanyIndustry().filter(
                                 (selectedIndustry) =>
                                    selectedIndustry.id !== optionGroup.id
                              )
                           console.log(
                              "🚀 ~ Select ~ onDelete ~ updatedIndustries:",
                              updatedIndustries
                           )
                           handleChange(selectorFilterKey, updatedIndustries)
                        }}
                     />
                  </Box>
               )}
               MenuProps={MenuProps}
            >
               {CompanyIndustryValues.map((companyIndustry) => (
                  <MenuItem key={companyIndustry.id} value={companyIndustry}>
                     {companyIndustry.name}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>
      </>
   )
}

type CompanyIndustryChipOptions = {
   items: OptionGroup[]
   onDelete: (optionGroup: OptionGroup) => void
}
const CompanyIndustryOptionChip: FC<CompanyIndustryChipOptions> = ({
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
