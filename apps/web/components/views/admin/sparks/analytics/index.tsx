import React, { useState } from "react"
import { Tabs, Tab, Select, MenuItem, MenuItemProps, Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
   controlHeader: {
      display: "flex",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      justifyContent: "space-between",
   },
   tabs: {
      ".Mui-selected": {
         fontWeight: 600,
      },
   },
   selectRoot: {
      width: "11.5rem",
      borderRadius: 50,
      "& .MuiSelect-select": {
         paddingTop: {
            xs: 1.745,
            md: 0,
         },
         paddingBottom: {
            xs: 1.745,
            md: 0,
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
   selectMenuItem: {
      paddingTop: 1.25,
      paddingBottom: 1.25,
      "&.Mui-selected": {
         backgroundColor: "#FAFAFE !important",
      },
   },
})

const StyledMenuItem: React.FC<MenuItemProps> = ({ children, ...props }) => {
   return (
      <MenuItem {...props} sx={styles.selectMenuItem}>
         {children}
      </MenuItem>
   )
}

const GroupSparkAnalytics = () => {
   const [tabValue, setTabValue] = useState("overview")
   const [selectValue, setSelectValue] = useState("7")

   const handleTabChange = (event, newValue) => {
      setTabValue(newValue)
   }

   const handleSelectChange = (event) => {
      setSelectValue(event.target.value)
   }

   return (
      <Box sx={styles.root}>
         <Box sx={styles.controlHeader}>
            <Tabs
               value={tabValue}
               onChange={handleTabChange}
               aria-label="Spark Analytics Tabs"
               textColor="secondary"
               indicatorColor="secondary"
               sx={styles.tabs}
            >
               <Tab label="Overview" value="overview" />
               <Tab label="Audience" value="audience" />
            </Tabs>
            <Select
               value={selectValue}
               onChange={handleSelectChange}
               sx={styles.selectRoot}
            >
               <StyledMenuItem value="7">Past 7 days</StyledMenuItem>
               <StyledMenuItem value="30">Past 30 days</StyledMenuItem>
               <StyledMenuItem value="180">Past 6 months</StyledMenuItem>
               <StyledMenuItem value="365">Last year</StyledMenuItem>
            </Select>
         </Box>
         <Box>
            {tabValue === "overview" && (
               <div style={{ maxWidth: "1110px", minWidth: "500px" }}>
                  Overview content for {selectValue} days
               </div>
            )}
            {tabValue === "audience" && (
               <div style={{ maxWidth: "1110px", minWidth: "500px" }}>
                  Audience content for {selectValue} days
               </div>
            )}
         </Box>
      </Box>
   )
}

export default GroupSparkAnalytics
