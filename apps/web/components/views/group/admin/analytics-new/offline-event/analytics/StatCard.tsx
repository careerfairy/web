import { Box, Card, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   // Shared styles
   statCard: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.white[200],
      border: "1px solid",
      borderColor: "neutral.50",
   },
   iconContainer: {
      backgroundColor: "secondary.50",
      borderRadius: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   // Mobile styles
   mobileCard: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 0.5,
      p: 1.5,
   },
   mobileIconContainer: {
      p: "4px",
      width: 24,
      height: 24,
   },
   mobileIcon: {
      width: 16,
      height: 16,
      color: "secondary.600",
   },
   // Desktop styles
   desktopCard: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      p: 1.5,
   },
   desktopIconContainer: {
      p: 1,
      width: 48,
      height: 48,
   },
   desktopIcon: {
      width: 32,
      height: 32,
      color: "secondary.600",
   },
})

type StatCardProps = {
   icon: React.ElementType
   label: string
   value: number
   isMobile: boolean
   position?: "left" | "right"
}

export const StatCard = ({
   icon: IconComponent,
   label,
   value,
   isMobile,
   position = "left",
}: StatCardProps) => {
   const borderRadius =
      position === "left"
         ? {
              borderTopLeftRadius: "16px",
              borderBottomLeftRadius: "16px",
           }
         : {
              borderTopRightRadius: "16px",
              borderBottomRightRadius: "16px",
           }

   if (isMobile) {
      return (
         <Card
            sx={[styles.statCard, styles.mobileCard, borderRadius]}
            elevation={0}
         >
            <Box sx={{ display: "flex" }}>
               {position === "right" && <Box id="right-stat-card" width={25} />}
               <Stack>
                  <Box
                     sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                     }}
                  >
                     <Box
                        sx={[styles.iconContainer, styles.mobileIconContainer]}
                     >
                        <Box component={IconComponent} sx={styles.mobileIcon} />
                     </Box>
                     <Typography variant="medium" color="neutral.600">
                        {label}
                     </Typography>
                  </Box>
                  <Typography variant="desktopBrandedH3" fontWeight={700}>
                     {value.toLocaleString()}
                  </Typography>
               </Stack>
            </Box>
         </Card>
      )
   }

   return (
      <Card
         sx={[
            styles.statCard,
            styles.desktopCard,
            borderRadius,
            position === "right" && { pl: 4.5 },
         ]}
         elevation={0}
      >
         {position === "right" && <Box width={10} />}
         <Box sx={[styles.iconContainer, styles.desktopIconContainer]}>
            <Box component={IconComponent} sx={styles.desktopIcon} />
         </Box>
         <Stack sx={{ flex: 1 }}>
            <Typography variant="medium" color="neutral.600">
               {label}
            </Typography>
            <Typography variant="desktopBrandedH3" fontWeight={700}>
               {value.toLocaleString()}
            </Typography>
         </Stack>
      </Card>
   )
}
