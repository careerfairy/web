import { Box, ButtonBase, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { BrandedSearchField } from "components/views/common/inputs/BrandedSearchField"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Calendar } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventsOverview } from "./context/OfflineEventsOverviewContext"

const styles = sxStyles({
   availableEventsCounter: {
      borderTopLeftRadius: "12px",
      borderBottomLeftRadius: "12px",
      backgroundColor: (theme) => theme.brand.white[100],
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
      px: "12px",
      width: "100%",
   },
   getMoreEventsMobile: {
      borderTopRightRadius: "12px",
      borderBottomRightRadius: "12px",
      color: (theme) => theme.brand.purple[600],
      p: "12px",
      backgroundColor: (theme) => theme.brand.white[300],
      width: "100%",
      borderLeft: (theme) => `1px solid ${theme.palette.neutral[50]}`,
   },
   getMoreEventsDesktop: {
      borderTopRightRadius: "12px",
      borderBottomRightRadius: "12px",
      color: (theme) => theme.brand.white[100],
      p: "14px 12px",
      width: "100%",
      backgroundColor: (theme) => theme.brand.purple[500],
      borderLeft: (theme) => `1px solid ${theme.palette.neutral[50]}`,
   },
   eventsCounterRoot: {
      height: "48px",
      minWidth: "fit-content",
   },
   eventsCounterRootMobile: {
      minWidth: "100%",
      height: "40px",
   },
})

export const OverviewHeader = () => {
   const isMobile = useIsMobile(700)
   const { group } = useGroup()
   const { searchTerm, setSearchTerm, handleCheckoutDialogOpen } =
      useOfflineEventsOverview()

   return (
      <Stack
         direction={isMobile ? "column" : "row"}
         justifyContent="space-between"
         alignItems="center"
         spacing={1}
      >
         <BrandedSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search"
            fullWidth
         />
         <Stack
            sx={
               isMobile
                  ? styles.eventsCounterRootMobile
                  : styles.eventsCounterRoot
            }
            direction="row"
         >
            <Stack
               direction="row"
               alignItems="center"
               spacing={1}
               sx={styles.availableEventsCounter}
            >
               <Box component={Calendar} size={16} color={"neutral.700"} />
               <Typography
                  variant="small"
                  color={"neutral.700"}
                  sx={{
                     whiteSpace: "nowrap",
                  }}
               >
                  {group?.availableOfflineEvents ?? 0}{" "}
                  {group?.availableOfflineEvents === 1 ? "event" : "events"}{" "}
                  available
               </Typography>
            </Stack>
            <ButtonBase
               sx={[
                  isMobile
                     ? styles.getMoreEventsMobile
                     : styles.getMoreEventsDesktop,
               ]}
               onClick={handleCheckoutDialogOpen}
            >
               <Typography variant="small">Promote more events</Typography>
            </ButtonBase>
         </Stack>
      </Stack>
   )
}
