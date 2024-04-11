import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { Box, Skeleton } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { ReactNode } from "react"

const styles = sxStyles({
   logoSkeleton: {},
   contentOffset: {
      mt: { xs: -11, md: -15 },
   },
   marginAuto: {
      mx: "auto",
   },
   button: {
      borderRadius: 4,
   },
})

const RegisterDataConsentViewSkeleton = ({ body }: { body?: ReactNode }) => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         heroContent={
            <HeroContent noMinHeight>
               <Stack
                  alignItems="center"
                  justifyContent={"center"}
                  pt={isMobile ? 6 : 12}
                  pb={isMobile ? 8 : 15}
                  sx={{ width: "100%" }}
               >
                  <HeroTitleSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack
                  alignItems="center"
                  spacing={7}
                  sx={styles.contentOffset}
                  px={isMobile ? 1 : 5}
               >
                  <HostImageSkeleton />

                  {body ? body : <ConsentTextSkeleton />}

                  <ButtonsSkeleton />
               </Stack>
            </MainContent>
         }
      />
   )
}

const HeroTitleSkeleton = () => {
   return (
      <>
         <Skeleton sx={styles.marginAuto} width="30%" height={30} />
         <Skeleton sx={styles.marginAuto} width="50%" height={30} />
      </>
   )
}

const HostImageSkeleton = () => {
   const isMobile = useIsMobile()
   return (
      <Skeleton
         sx={styles.logoSkeleton}
         variant={"circular"}
         width={isMobile ? 80 : 136}
         height={isMobile ? 80 : 136}
      />
   )
}

const ConsentTextSkeleton = () => {
   return <Skeleton sx={{ borderRadius: 10 }} width="100%" height={40} />
}

const ButtonsSkeleton = () => {
   return (
      <Box>
         <Skeleton
            width={150}
            sx={[styles.marginAuto, styles.button]}
            height={30}
         />
         <Skeleton
            width={60}
            sx={[styles.button, styles.marginAuto]}
            height={30}
         />
      </Box>
   )
}

export default RegisterDataConsentViewSkeleton
