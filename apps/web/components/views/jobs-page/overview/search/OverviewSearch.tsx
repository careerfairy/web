import { Box, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChipDropdownProvider } from "components/views/common/ChipDropdown/ChipDropdownContext"
import { sxStyles } from "types/commonTypes"
import { SearchByLocation } from "./by/SearchByLocation"
import { SearchByTags } from "./by/SearchByTags"
import { SearchByTerm } from "./by/SearchByTerm"
import { SearchByType } from "./by/SearchByType"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   stickyRoot: {
      position: "sticky",
      top: `calc(var(--app-bar-visible, 0) * 60px)`,
      backgroundColor: "#F7F8FC",
      py: 2,
      zIndex: 1,
      transition: `top 200ms ease-in-out`,
   },
   searchBy: {
      overflowX: "auto",
      boxSizing: "border-box",
      overflowClipMargin: "106px",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
         display: "none",
      },
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "32px !important",
      },
   },
   searchByTerm: {
      px: {
         xs: "16px !important",
         sm: "16px !important",
         md: "32px !important",
      },
   },
})

export const OverviewSearch = () => {
   const isMobile = useIsMobile()

   return (
      <Stack sx={[styles.root, isMobile && styles.stickyRoot]} spacing={2}>
         <Box sx={styles.searchByTerm}>
            <SearchByTerm />
         </Box>
         <Stack direction="row" spacing={1} sx={styles.searchBy}>
            <ChipDropdownProvider>
               <SearchByLocation />
               <SearchByTags />
               <SearchByType />
            </ChipDropdownProvider>
         </Stack>
      </Stack>
   )
}
