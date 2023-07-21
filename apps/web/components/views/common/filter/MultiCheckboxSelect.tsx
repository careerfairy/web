import React, { Dispatch, memo, useCallback, useMemo } from "react"
import {
   Checkbox,
   CircularProgress,
   FormControlLabel,
   FormGroup,
   Stack,
   Typography,
} from "@mui/material"
import isEqual from "react-fast-compare"
import { Box } from "@mui/system"
import { StyledCheckbox } from "components/views/group/admin/common/inputs"

const MultiCheckboxSelect = ({
   inputName,
   allValues,
   selectedItems = [],
   onSelectItems = () => {},
   getLabelFn = (option) => option.name, // displayed name
   setFieldValue = () => {}, // formik field
   getValueFn = (option) => option.id, // field value
   getKeyFn = (option) => option.id, // field id
   isSingleColumn = false,
   useStyledCheckbox = false,
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

   const firstColumnValues = useMemo(
      () =>
         isSingleColumn
            ? allValues
            : allValues.slice(0, allValues.length / 2 + 1),
      [allValues, isSingleColumn]
   )

   const secondColumnValues = useMemo(
      () =>
         isSingleColumn ? undefined : allValues.slice(allValues.length / 2 + 1),
      [allValues, isSingleColumn]
   )

   const formControl = useCallback(
      (option) => (
         <FormControlLabel
            key={getKeyFn(option)}
            onChange={handleChange}
            name={getKeyFn(option)}
            control={useStyledCheckbox ? <StyledCheckbox /> : <Checkbox />}
            label={
               <Typography fontWeight={400} fontSize={"18px"}>
                  {getLabelFn(option)}
               </Typography>
            }
            labelPlacement={"start"}
            sx={{
               display: "flex",
               justifyContent: "space-between",
            }}
            checked={isChecked(getKeyFn(option))}
         />
      ),
      [getKeyFn, getLabelFn, handleChange, isChecked, useStyledCheckbox]
   )

   return allValues.length ? (
      <FormGroup key={inputName}>
         <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 0, md: 8 }}
         >
            <Box
               sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
               {firstColumnValues.map(formControl)}
            </Box>
            {isSingleColumn ? null : (
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "column",
                     width: "100%",
                  }}
               >
                  {secondColumnValues.map(formControl)}
               </Box>
            )}
         </Stack>
      </FormGroup>
   ) : (
      <CircularProgress />
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
   isSingleColumn?: boolean
   useStyledCheckbox?: boolean
}

export default memo(MultiCheckboxSelect, isEqual)
