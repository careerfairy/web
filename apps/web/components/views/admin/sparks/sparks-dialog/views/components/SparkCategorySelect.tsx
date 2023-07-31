import {
   SparkCategory,
   SparksCategories,
   getCategoryEmoji,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   Chip,
   MenuItem,
   MenuList,
   SelectProps,
   Typography,
} from "@mui/material"
import Popover, { popoverClasses } from "@mui/material/Popover"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import { FC, useState } from "react"
import { sxStyles } from "types/commonTypes"
import DropDownUpIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import DropDownDownIcon from "@mui/icons-material/KeyboardArrowUpRounded"

const styles = sxStyles({
   chip: {
      px: 1.5,
      py: 1,
      borderRadius: "46px",
      textAlign: "center",
      fontSize: "1rem",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "0.04021rem",
      border: "1px solid #F1F1F1",
      background: "#F8F8F8",
      "& span": {
         p: 0,
      },
   },
   selectedChip: {
      color: "white",
      backgroundColor: "secondary.main",
      "&:hover": {
         backgroundColor: "secondary.main",
      },
   },
   popover: {
      [`& .${popoverClasses.paper}`]: {
         borderRadius: 2,
         border: "1px solid #ECECEC",
         boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.05)",
      },
   },
   menuList: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      maxWidth: 370,
      gap: 1,
      p: 1.5,
   },
   helpText: {
      color: "#B9B9B9",
      fontSize: "1rem",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "0.04021rem",
      width: "100%",
      mt: 1,
   },
})

type Props = {
   name: string
}

type ValueType = SparkCategory["id"]

const SparkCategorySelect: FC<Props> = ({ name }) => {
   const [anchorEl, setAnchorEl] = useState(null)
   const [{ onBlur, ...field }, meta, helpers] = useField<ValueType>(name)

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = (option: ValueType) => {
      onBlur({ target: { name } }) // Call onBlur when the popover is closed
      helpers.setValue(option)
      setAnchorEl(null)
   }

   const open = Boolean(anchorEl)
   const id = open ? "spark-category-select" : undefined

   return (
      <div>
         <BrandedTextField
            id="custom-select"
            label="Category"
            placeholder="Select a category"
            value={field.value}
            select={Boolean(field.value)} // Placeholder is not shown if select is true
            InputProps={{
               readOnly: true,
               endAdornment: open ? <DropDownDownIcon /> : <DropDownUpIcon />,
            }}
            onClick={handleClick}
            fullWidth
            SelectProps={selectProps}
            {...field}
            error={meta.touched ? Boolean(meta.error) : null}
            helperText={meta.touched ? meta.error : null}
         >
            {/**
             * To match the Figma design, we created a custom select component.
             * These menu items is to prevent the console warning, they are never shown
             */}
            {categories.map(renderHiddenMenuItem)}
         </BrandedTextField>
         <Popover
            id={id}
            open={open}
            elevation={0}
            anchorEl={anchorEl}
            onClose={() => handleClose(field.value)}
            anchorOrigin={acnchorOrigin}
            transformOrigin={transformOrigin}
            sx={styles.popover}
         >
            <MenuList sx={styles.menuList}>
               {categories.map((category) => (
                  <MenuItem
                     key={category.id}
                     onClick={() => handleClose(category.id)}
                     sx={[
                        styles.chip,
                        field.value === category.id && styles.selectedChip,
                     ]}
                  >
                     {getCategoryEmoji(category.id)} {category.name}
                  </MenuItem>
               ))}
               <Typography sx={styles.helpText}>
                  You can select only 1 category
               </Typography>
            </MenuList>
         </Popover>
      </div>
   )
}

const renderHiddenMenuItem = (category: SparkCategory) => (
   <MenuItem key={category.id} value={category.id} sx={{ display: "none" }}>
      {category.name}
   </MenuItem>
)

const acnchorOrigin = {
   vertical: "bottom",
   horizontal: "left",
} as const

const transformOrigin = {
   vertical: "top",
   horizontal: "left",
} as const

const selectProps: Partial<SelectProps> = {
   renderValue: (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId)
      return (
         <Chip
            sx={[styles.chip, styles.selectedChip]}
            label={`${getCategoryEmoji(category.id)} ${category.name}`}
         />
      )
   },
}

const categories = Object.values(SparksCategories)

export default SparkCategorySelect
