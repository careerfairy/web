import React, { useState, useMemo } from "react"
import {
   Select,
   SelectProps,
   SwipeableDrawer,
   SwipeableDrawerProps,
   Box,
   MenuItem,
   BoxProps,
   SxProps,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = {
   selectRoot: {
      width: "11.5rem",
      borderRadius: 50,
      color: "#7A7A8E",
      paddingTop: 0,
      paddingBottom: 0,
      "& .MuiSelect-select": {
         paddingTop: {
            xs: 1.745,
            md: 1.745,
         },
         paddingBottom: {
            xs: 1.745,
            md: 1.745,
         },
         paddingLeft: 2.5,
      },
      "& fieldset": {
         marginTop: "5px",
         marginBottom: "5px",
         "&.MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23) !important",
         },
      },
   },
   selectMenu: {
      ".MuiList-padding": {
         paddingTop: "0 !important",
      },
   },
   selectMenuItem: {
      color: "#3D3D47",
      paddingTop: 1.5,
      paddingBottom: 1.5,
      "&.Mui-selected": {
         backgroundColor: "#FAFAFE !important",
      },
   },
   selectWrapper: {
      width: "fit-content",
   },
   selectWrapperInner: {
      width: "fit-content",
      pointerEvents: {
         xs: "none",
         md: "auto",
      },
   },
   drawer: {
      ".MuiPaper-root": {
         ":before": {
            content: '""',
            display: "block",
            margin: "auto",
            marginTop: "10px",
            marginBottom: "10px",
            width: "92px",
            height: "3px",
            backgroundColor: "#E1E1E1",
            borderRadius: "10px",
         },
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   selectMenuItemDrawer: {
      "&.MuiMenuItem-root": {
         backgroundColor: "#FAFAFE !important",
      },
   },
}

export const ResponsiveSelectWithDrawer: React.FC<{
   selectValue: string
   setSelectValue: (value: string) => void
   options: { value: string; label: string }[]
   selectProps?: SelectProps
   selectContainerProps?: BoxProps
   drawerProps?: SwipeableDrawerProps
}> = ({
   selectValue,
   setSelectValue,
   options,
   selectProps,
   selectContainerProps,
   drawerProps,
}) => {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
   const isMobile = useIsMobile()

   const handleSelectChange = (event) => {
      setSelectValue(event.target.value)
   }

   const handleClick = isMobile ? () => setIsDrawerOpen(true) : undefined

   const combineStyles = (myStyles: SxProps, propsStyles: SxProps) => [
      myStyles,
      ...(Array.isArray(propsStyles) ? propsStyles : [propsStyles]),
   ]

   const drawerOptions = useMemo(
      () =>
         options.map((option) => ({
            ...option,
            handleOnClick: () => {
               setSelectValue(option.value)
               setIsDrawerOpen(false)
            },
            isSelected: option.value === selectValue,
         })),
      [options, selectValue, setSelectValue]
   )

   return (
      <>
         <Box
            onClick={handleClick}
            {...selectContainerProps}
            sx={combineStyles(styles.selectWrapper, selectContainerProps?.sx)}
         >
            <Box sx={styles.selectWrapperInner}>
               <Select
                  value={selectValue}
                  onChange={handleSelectChange}
                  {...selectProps}
                  sx={combineStyles(styles.selectRoot, selectProps?.sx)}
                  MenuProps={{ sx: styles.selectMenu }}
               >
                  {options.map((option, index) => (
                     <MenuItem
                        key={index}
                        value={option.value}
                        sx={styles.selectMenuItem}
                     >
                        {option.label}
                     </MenuItem>
                  ))}
               </Select>
            </Box>
         </Box>
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => setIsDrawerOpen(false)}
            onOpen={() => null}
            open={isDrawerOpen}
            {...drawerProps}
            sx={combineStyles(styles.drawer, drawerProps?.sx)}
         >
            {drawerOptions.map((option, index) => (
               <MenuItem
                  key={index}
                  value={option.value}
                  onClick={option.handleOnClick}
                  sx={option.isSelected ? styles.selectMenuItemDrawer : null}
               >
                  {option.label}
               </MenuItem>
            ))}
         </SwipeableDrawer>
      </>
   )
}
