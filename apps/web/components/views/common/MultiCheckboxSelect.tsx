import React, { Dispatch, memo, useCallback, useMemo } from "react"
import {
   Checkbox,
   FormControlLabel,
   FormGroup,
   Stack,
   Typography,
} from "@mui/material"
import isEqual from "react-fast-compare"
import { Box } from "@mui/system"

const MultiCheckboxSelect = ({
   inputName,
   allValues,
   selectedItems = [],
   onSelectItems = () => {},
   getLabelFn = (option) => option.name, // displayed name
   setFieldValue = () => {}, // formik field
   getValueFn = (option) => option.id, // field value
   getKeyFn = (option) => option.id, // field id
}: Props) => {
   const handleChange = useCallback(
      (event, checked) => {
         const name = event.target.name
         const selectedOption = allValues.find((value) => value.id === name)

         let dataToBubbleUp = checked
            ? [...selectedItems, selectedOption]
            : selectedItems.filter((value) => value.id !== name)

         onSelectItems?.(dataToBubbleUp)

         if (setFieldValue)
            setFieldValue(inputName, dataToBubbleUp.map(getValueFn))
      },
      [
         allValues,
         getValueFn,
         inputName,
         onSelectItems,
         selectedItems,
         setFieldValue,
      ]
   )

   const isChecked = useCallback(
      (checkboxId): boolean => {
         return selectedItems?.some((item) => item.id === checkboxId)
      },
      [selectedItems]
   )

   const leftRowValues = useMemo(
      () => allValues.slice(0, allValues.length / 2),
      [allValues]
   )
   const rightValues = useMemo(
      () => allValues.slice(allValues.length / 2),
      [allValues]
   )

   return (
      <FormGroup key={inputName}>
         <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 0, md: 8 }}
         >
            <Box
               sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
               {leftRowValues.map((option) => (
                  <FormControlLabel
                     key={getKeyFn(option)}
                     onChange={handleChange}
                     name={getKeyFn(option)}
                     control={<Checkbox />}
                     label={
                        <Typography fontWeight={400} fontSize={"18px"}>
                           {getLabelFn(option)}
                        </Typography>
                     }
                     labelPlacement="start"
                     sx={{ display: "flex", justifyContent: "space-between" }}
                     checked={isChecked(getKeyFn(option))}
                  />
               ))}
            </Box>
            <Box
               sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
               {rightValues.map((option) => (
                  <FormControlLabel
                     key={getKeyFn(option)}
                     name={getKeyFn(option)}
                     onChange={handleChange}
                     control={<Checkbox />}
                     label={
                        <Typography fontWeight={400} fontSize={"18px"}>
                           {getLabelFn(option)}
                        </Typography>
                     }
                     labelPlacement="start"
                     sx={{ display: "flex", justifyContent: "space-between" }}
                     checked={isChecked(getKeyFn(option))}
                  />
               ))}
            </Box>
         </Stack>
      </FormGroup>
   )
}

type Props = {
   inputName: string
   setFieldValue?: (name, value) => void
   onSelectItems?: Dispatch<any>
   selectedItems: any[]
   allValues: any[]
   getLabelFn?: (obj: any) => string
   getValueFn?: (obj: any) => string
   getKeyFn?: (obj: any) => string
}

export default memo(MultiCheckboxSelect, isEqual)
