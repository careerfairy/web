import React, { useMemo } from "react"
import { AppBar, Tabs } from "@mui/material"
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab"
import { sxStyles } from "../../../../types/commonTypes"
import Search from "../../wishlist/Search"
import Box from "@mui/material/Box"

const styles = sxStyles({
   indicator: {
      height: (theme) => theme.spacing(0.7),
      borderRadius: (theme) => theme.spacing(1, 1, 0.3, 0.3),
   },
   root: {
      boxShadow: "none",
      display: "flex",
      flexDirection: "row",
   },
   tab: {
      fontWeight: (theme) => theme.typography.fontWeightBold,
   },
})

type Props = {
   handleChange: (event, newEvent) => void
   value: any
   tabsColor?: string
   hasFilter?: boolean
}

const StreamsTab = ({
   handleChange,
   value,
   tabsColor,
   hasFilter = false,
}: Props) => {
   const showFilter = useMemo(() => {
      return hasFilter && value === "upcomingEvents"
   }, [hasFilter, value])

   return (
      <AppBar sx={styles.root} position="static" color="transparent">
         <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            TabIndicatorProps={
               {
                  sx: {
                     ...styles.indicator,
                     backgroundColor: tabsColor,
                  },
               } as any
            }
            variant={hasFilter ? "standard" : "fullWidth"}
            aria-label="full width tabs example"
            sx={{ width: "100%" }}
         >
            <SimpleTab
               sx={{
                  ...styles.tab,
                  color: tabsColor,
                  minWidth: "200px",
               }}
               label="Upcoming Events"
               value="upcomingEvents"
               index={0}
            />
            <SimpleTab
               sx={{
                  ...styles.tab,
                  color: tabsColor,
                  minWidth: "200px",
               }}
               label="Past Events"
               value="pastEvents"
               index={1}
            />
         </Tabs>
         {showFilter ? (
            <Box
               sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "end",
                  mt: 1,
               }}
            >
               <Search showSearch={false} />
            </Box>
         ) : null}
      </AppBar>
   )
}

export default StreamsTab
