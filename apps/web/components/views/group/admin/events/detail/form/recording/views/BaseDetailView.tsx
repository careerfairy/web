import { Box, IconButton, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChevronLeft, X } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
   },
   header: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      mb: { xs: 0, md: 2 },
      mt: 1,
   },
   headerMobile: {
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      backgroundColor: (theme) => theme.palette.background.paper,
      zIndex: 1,
      mt: 0,
      pb: 1.5,
   },
   backButton: {
      p: 0.5,
      minWidth: "auto",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[300],
      },
   },
   closeButton: {
      p: 0.5,
      minWidth: "auto",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[300],
      },
   },
   title: {
      color: "neutral.800",
      fontWeight: 600,
      flexGrow: 1,
   },
   content: {
      flex: 1,
      overflow: "auto",
   },
})

type BaseDetailViewProps = {
   title: string
   onBack: () => void
   children: React.ReactNode
}

export const BaseDetailView = ({
   title,
   onBack,
   children,
}: BaseDetailViewProps) => {
   const isMobile = useIsMobile()

   return (
      <Stack sx={styles.root}>
         <Box sx={[styles.header, isMobile && styles.headerMobile]}>
            {!isMobile ? (
               <IconButton onClick={onBack} sx={styles.backButton}>
                  <ChevronLeft size={20} />
               </IconButton>
            ) : null}
            <Typography variant="brandedBody" sx={styles.title}>
               {title}
            </Typography>
            {isMobile ? (
               <IconButton onClick={onBack} sx={styles.closeButton}>
                  <X size={20} />
               </IconButton>
            ) : null}
         </Box>
         <Box sx={styles.content}>{children}</Box>
      </Stack>
   )
}
