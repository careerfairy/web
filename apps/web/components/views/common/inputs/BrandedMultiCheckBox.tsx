import * as React from "react"
import { SxProps, Theme, useTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import Chip from "@mui/material/Chip"
import { useState } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"

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

function getStyles(
   value: string,
   options: readonly OptionGroup[],
   theme: Theme
) {
   return {
      fontWeight:
         options.map((option) => option.id).indexOf(value) === -1
            ? theme.typography.fontWeightRegular
            : theme.typography.fontWeightMedium,
   }
}

type Props = {
   label: string
   options: OptionGroup[]
   value: OptionGroup[]
   sx?: SxProps
   onChange: (values: OptionGroup[]) => void
}

type OnChangeValue = Event & {
   target: {
      value: string[] | OptionGroup[]
      name: string
   }
}

const BrandedMultiCheckBox = ({
   label,
   options,
   value,
   sx = { width: 300, m: 1 },
   onChange,
}: Props) => {
   const theme = useTheme()

   const handleChange = (event: OnChangeValue) => {
      const selectedIds = event.target.value.map((selected) =>
         typeof selected === "object" ? selected.id : selected
      )
      const selectedOptions = selectedIds.map((id) =>
         options.find((option) => option.id === id)
      )
      onChange(selectedOptions)
   }

   return (
      <div>
         <FormControl sx={sx}>
            <InputLabel id="branded-multi-checkbox-label">{label}</InputLabel>
            <Select
               labelId="branded-multi-checkbox-label"
               id="branded-multi-checkbox"
               multiple
               value={value}
               onChange={handleChange}
               input={
                  <OutlinedInput id="select-multiple-chip" label="Industry" />
               }
               renderValue={(selected: OptionGroup[]) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                     {selected.map((value) => (
                        <Chip key={value.id} label={value.name} />
                     ))}
                  </Box>
               )}
               native={false}
               MenuProps={MenuProps}
            >
               {options.map((option) => (
                  <MenuItem
                     key={option.id}
                     value={option.id}
                     style={getStyles(option.id, options, theme)}
                  >
                     {option.name}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>
      </div>
   )
}

export default BrandedMultiCheckBox
