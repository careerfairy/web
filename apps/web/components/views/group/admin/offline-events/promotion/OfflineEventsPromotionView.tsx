import { Box, Button, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventsOverview } from "../context/OfflineEventsOverviewContext"
import { PromotionContent } from "./PromotionContent"
import { PromotionHeader } from "./PromotionHeader"

const styles = sxStyles({
   container: {
      px: {
         md: "8px",
         xs: 0,
         sm: 0,
      },
      pt: {
         md: "24px",
         xs: "12px",
         sm: "12px",
      },
      mx: {
         md: 0,
         xs: "-24px",
         sm: "-24px",
      },
   },
   root: {
      alignItems: "center",
      justifyContent: "center",
      p: "32px 20px",
      borderRadius: "16px 16px 0 0",
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      background:
         "linear-gradient(180deg, rgba(238, 219, 255, 0.15) 0%, rgba(187, 169, 255, 0.15) 62.59%), #FCFCFE",
   },
})

export const OfflineEventsPromotionView = () => {
   const { handleCheckoutDialogOpen } = useOfflineEventsOverview()
   return (
      <Box sx={styles.container}>
         <Stack spacing={4} sx={styles.root}>
            <PromotionHeader />
            <PromotionContent />
            <Stack spacing={"12px"} alignItems={"center"}>
               <Typography
                  fontSize={"40px"}
                  fontWeight={800}
                  color={"neutral.800"}
                  textAlign="center"
               >
                  Make your offline events visible
               </Typography>
               <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCheckoutDialogOpen}
               >
                  Start promoting now
               </Button>
            </Stack>
         </Stack>
      </Box>
   )
}
