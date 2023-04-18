import React, { useMemo } from "react"
import { AppBar, Tabs } from "@mui/material"
import SimpleTab from "../../../../../materialUI/GlobalTabs/SimpleTab"
import { sxStyles } from "../../../../../types/commonTypes"
import Filter, { FilterEnum } from "../../filter/Filter"
import Box from "@mui/material/Box"
import useIsMobile from "../../../../custom-hook/useIsMobile"

const styles = sxStyles({
   indicator: {
      height: (theme) => theme.spacing(0.7),
      borderRadius: (theme) => theme.spacing(1, 1, 0.3, 0.3),
   },
   root: {
      boxShadow: "none",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
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
   hideTabs?: boolean
}

export const filtersToShow = [
   FilterEnum.languages,
   FilterEnum.interests,
   // FilterEnum.jobCheck, TODO: Removed temporarily
   FilterEnum.companyCountries,
   FilterEnum.companySizes,
   FilterEnum.companyIndustries,
]

const StreamsTab = ({
   handleChange,
   value,
   tabsColor,
   hasFilter = false,
   hideTabs = false,
}: Props) => {
   const showFilter = useMemo(() => {
      return hasFilter && value === "upcomingEvents"
   }, [hasFilter, value])
   const isMobile = useIsMobile()

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
            sx={{ width: "100%", minWidth: "fit-content" }}
         >
            {hideTabs ? null : (
               <>
                  <SimpleTab
                     sx={{
                        ...styles.tab,
                        color: tabsColor,
                        minWidth: {
                           xs: showFilter ? "40%" : "50%",
                           sm: "200px",
                        },
                     }}
                     label="Upcoming Events"
                     value="upcomingEvents"
                     index={0}
                  />
                  <SimpleTab
                     sx={{
                        ...styles.tab,
                        color: tabsColor,
                        minWidth: {
                           xs: showFilter ? "40%" : "50%",
                           sm: "200px",
                        },
                     }}
                     label="Past Events"
                     value="pastEvents"
                     index={1}
                  />
               </>
            )}
            {isMobile && showFilter ? (
               <Box
                  sx={{
                     display: "flex",
                     width: "100%",
                     justifyContent: "end",
                     mt: 1,
                  }}
               >
                  <Filter filtersToShow={filtersToShow} />
               </Box>
            ) : null}
         </Tabs>
         {!isMobile && showFilter ? (
            <Box
               sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "end",
                  mt: 1,
               }}
            >
               <Filter filtersToShow={filtersToShow} />
            </Box>
         ) : null}
      </AppBar>
   )
}

export default StreamsTab
