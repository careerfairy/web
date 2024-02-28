import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import {
   FormControlLabel,
   FormControlLabelProps,
   FormGroup,
   FormHelperText,
   useForkRef,
} from "@mui/material"
import { Box, Checkbox, FormControl } from "@mui/material"
import { RadioProps } from "@mui/material/Radio"
import { styled } from "@mui/material/styles"
import { forwardRef } from "react"
import { Control, FieldPath, FieldValues, useController } from "react-hook-form"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   checkboxIconWrapper: {
      width: 24,
      height: 24,
      borderRadius: "4px",
      bgcolor: (theme) => theme.brand.black[400],
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   dotIcon: {
      width: 18,
      height: 18,
      color: "black",
   },
})

export type BrandedCheckboxProps = Omit<RadioProps, "variant">

const BrandedCheckbox = styled((props: BrandedCheckboxProps) => (
   <Checkbox
      color={"default"}
      icon={<Box sx={styles.checkboxIconWrapper} />}
      checkedIcon={
         <Box sx={styles.checkboxIconWrapper}>
            <CheckRoundedIcon sx={styles.dotIcon} fontSize={"small"} />
         </Box>
      }
      {...props}
   />
))(({ theme }) => ({
   color: theme.palette.mode === "dark" ? undefined : "black !important",
}))

type BrandedCheckBoxControllerProps<
   TFieldValues extends FieldValues = FieldValues,
   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
   name: TName
   control?: Control<TFieldValues>
   labelProps?: Omit<FormControlLabelProps, "label" | "control">
   label?: FormControlLabelProps["label"]
   helperText?: string
} & Omit<BrandedCheckboxProps, "name">

export const BrandedCheckBoxController = forwardRef<
   HTMLDivElement,
   BrandedCheckBoxControllerProps
>(
   (
      {
         name,
         control,
         inputRef,
         required,
         labelProps,
         label,
         helperText,
         ...checkBoxprops
      },
      ref
   ) => {
      const {
         field: { onChange, ref: fieldRef, value },
         fieldState: { error },
      } = useController({
         name,
         control,
         disabled: checkBoxprops.disabled,
      })

      const handleInputRef = useForkRef(fieldRef, inputRef)

      return (
         <FormControl required={required} error={!!error} ref={ref}>
            <FormGroup row>
               <FormControlLabel
                  {...labelProps}
                  label={label || ""}
                  control={
                     <Checkbox
                        {...checkBoxprops}
                        color={checkBoxprops.color || "primary"}
                        sx={combineStyles(checkBoxprops.sx, {
                           color: error ? "error.main" : undefined,
                        })}
                        value={value}
                        checked={!!value}
                        onChange={onChange}
                        inputRef={handleInputRef}
                     />
                  }
               />
            </FormGroup>
            {Boolean(helperText) && (
               <FormHelperText error={!!error}>{helperText}</FormHelperText>
            )}
         </FormControl>
      )
   }
)

BrandedCheckBoxController.displayName = "BrandedCheckBoxController"

export default BrandedCheckbox
