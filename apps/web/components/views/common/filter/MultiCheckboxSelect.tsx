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
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   justifiedLabel: {
      ml: 0,
      display: "flex",
      justifyContent: "space-between",
   },
   unjustifiedLabel: {
      ml: 0,
      mr: 5,
   },
   labelText: {
      fontWeight: 400,
      fontSize: "18px",
   },
   column: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
})

const MultiCheckboxSelect = ({
   inputName,
   allValues,
   selectedItems = [],
   onSelectItems = () => {},
   getLabelFn = (option) => option.name, // displayed name
   setFieldValue = () => {}, // formik field
   getValueFn = (option) => option.id, // field value
   getKeyFn = (option) => option.id, // field id
   type = "doubleColumn", // whether the checklist is shown in a single justified/unjustified column or in two columns
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
         type !== "doubleColumn"
            ? allValues
            : allValues.slice(0, allValues.length / 2 + 1),
      [allValues, type]
   )

   const secondColumnValues = useMemo(
      () =>
         type !== "doubleColumn"
            ? undefined
            : allValues.slice(allValues.length / 2 + 1),
      [allValues, type]
   )

   const formControl = useCallback(
      (option) => (
         <FormControlLabel
            key={getKeyFn(option)}
            onChange={handleChange}
            name={getKeyFn(option)}
            control={useStyledCheckbox ? <StyledCheckbox /> : <Checkbox />}
            label={
               <Typography sx={styles.labelText}>
                  {getLabelFn(option)}
               </Typography>
            }
            labelPlacement={type === "unjustified" ? "end" : "start"}
            sx={
               type === "unjustified"
                  ? styles.unjustifiedLabel
                  : styles.justifiedLabel
            }
            checked={isChecked(getKeyFn(option))}
         />
      ),
      [getKeyFn, getLabelFn, handleChange, isChecked, type, useStyledCheckbox]
   )

   return allValues.length ? (
      <FormGroup key={inputName}>
         <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 0, md: 8 }}
         >
            <Box sx={type === "unjustified" ? {} : styles.column}>
               {firstColumnValues.map(formControl)}
            </Box>
            {type !== "doubleColumn" ? null : (
               <Box sx={styles.column}>
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
   type?: MultiCheckboxSelectType
   useStyledCheckbox?: boolean
}

export type MultiCheckboxSelectType =
   | "singleColumn"
   | "doubleColumn"
   | "unjustified"

export default memo(MultiCheckboxSelect, isEqual)
