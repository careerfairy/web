import React, { useState } from "react"
import {
   FormControl,
   FormControlLabel,
   FormLabel,
   Radio,
   RadioGroup,
} from "@mui/material"
import { Wish, WishCategories } from "@careerfairy/shared-lib/dist/wishes"

interface Props {
   selectedCategory: Wish["category"]
   handleChange: (e) => any
   setFieldValue: (field: string, value: any) => void
}
const CategorySelect = ({
   handleChange,
   selectedCategory,
   setFieldValue,
}: Props) => {
   const [options] = useState<Wish["category"][]>(
      Object.values(WishCategories).map((value) => value)
   )
   return (
      <FormControl>
         <FormLabel id="wish-category-select-label">Category</FormLabel>
         <RadioGroup
            row
            value={selectedCategory}
            onChange={(e) => {
               setFieldValue("companyNames", [])
               handleChange(e)
            }}
            aria-labelledby="wish-category-select-label"
            name="category"
         >
            {options.map((option) => (
               <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
               />
            ))}
         </RadioGroup>
      </FormControl>
   )
}

export default CategorySelect
