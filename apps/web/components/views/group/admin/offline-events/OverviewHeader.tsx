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
      p: "12px",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderRight: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderBottom: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderLeft: "none",
   },
   getMoreEventsDesktop: {
      borderTopRightRadius: "12px",
      borderBottomRightRadius: "12px",
      p: "14px 12px",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderRight: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderBottom: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderLeft: "none",
   },
   eventsCounterRoot: {
      height: "48px",
      minWidth: "fit-content",
   },
   eventsCounterRootMobile: {
      minWidth: "100%",
      height: "48px",
      display: "flex",
      alignItems: "stretch",
   },
   moreEventsNoneAvailable: {
      backgroundColor: (theme) => theme.brand.purple[500],
      color: (theme) => theme.brand.white[100],
   },
   moreEvents: {
      backgroundColor: (theme) => theme.brand.white[300],
      color: (theme) => theme.brand.purple[600],
   },
})

export const OverviewHeader = () => {
   const isMobile = useIsMobile(700)
   const { group, groupPresenter } = useGroup()
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
                  groupPresenter?.availableOfflineEvents === 0
                     ? styles.moreEventsNoneAvailable
                     : styles.moreEvents,
               ]}
               onClick={handleCheckoutDialogOpen}
            >
               <Typography variant="small" sx={{ whiteSpace: "nowrap" }}>
                  Promote more events
               </Typography>
            </ButtonBase>
         </Stack>
      </Stack>
   )
}
