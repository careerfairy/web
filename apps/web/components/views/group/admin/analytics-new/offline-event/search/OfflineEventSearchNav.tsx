import { Box, Card, InputBase } from "@mui/material"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Search as FindIcon } from "react-feather"
import useSWR from "swr"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   wrapper: {
      width: "100%",
      backgroundColor: (theme) => theme.brand.white[400],
      p: 2,
      px: 2,
      py: 1.5,
      gap: 1.25,
      display: "flex",
      flexDirection: "column",
   },
   searchCard: {
      backgroundColor: (theme) => theme.brand.white[100],
      border: "1px solid",
      borderColor: "secondary.50",
      borderRadius: "12px",
      height: 48,
      display: "flex",
      alignItems: "center",
      px: 1.5,
      py: 0.5,
      gap: 1,
   },
   searchInput: {
      flex: 1,
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      lineHeight: "24px",
      color: "neutral.800",
      "& input": {
         padding: 0,
         "&::placeholder": {
            color: "neutral.800",
            opacity: 1,
         },
      },
   },
   iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flexShrink: 0,
      "& svg": {
         width: 20,
         height: 20,
      },
   },
})

const OfflineEventSearchNav = () => {
   const { group } = useGroup()
   // Dummy data for now - will be replaced with actual search logic
   const searchValue = "Virtual Case Experience"

   const { data: offlineEventStats } = useSWR(["offline-events"], async () => {
      return offlineEventService.getFutureAndPublishedOfflineEventStats(
         group.id
      )
   })

   console.log(offlineEventStats)

   return (
      <Box sx={styles.wrapper}>
         <Card sx={styles.searchCard} elevation={0}>
            <Box sx={styles.iconContainer}>
               <FindIcon color="#7A7A8E" strokeWidth={2} />
            </Box>
            <InputBase
               value={searchValue}
               placeholder="Search offline events"
               sx={styles.searchInput}
               fullWidth
               readOnly
            />
         </Card>
      </Box>
   )
}

export default OfflineEventSearchNav
