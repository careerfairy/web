import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import { Box, Skeleton } from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { ReactNode } from "react"

const styles = sxStyles({
   logoSkeleton: {
      borderRadius: 4,
   },
   contentOffset: {
      mt: -13,
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
                  pt={3}
                  pb={9}
                  sx={{ width: "100%" }}
               >
                  <HostTitleSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack
                  alignItems="center"
                  spacing={5}
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

const HostTitleSkeleton = () => {
   return (
      <>
         <Skeleton sx={styles.marginAuto} width="30%" height={30} />
         <Skeleton sx={styles.marginAuto} width="50%" height={30} />
      </>
   )
}

const HostImageSkeleton = () => {
   return (
      <Skeleton
         sx={styles.logoSkeleton}
         variant={"rectangular"}
         width={130}
         height={130}
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
