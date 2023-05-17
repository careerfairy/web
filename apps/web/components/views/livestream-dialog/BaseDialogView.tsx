import { FC, forwardRef, ReactNode } from "react"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../types/commonTypes"
import { Box, Container, IconButton } from "@mui/material"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import Image from "next/image"
import useIsMobile from "../../custom-hook/useIsMobile"
import { useLiveStreamDialog } from "./LivestreamDialog"

const responsiveBreakpoint = "md"

const styles = sxStyles({
   root: {
      p: {
         xs: 1,
         [responsiveBreakpoint]: 2.25,
      },
   },
   topLeft: {
      position: "absolute",
      top: 0,
      left: 0,
      padding: 1,
   },
   topRight: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: 1,
   },
   closeIcon: {
      color: "white",
      fontSize: "24px",
   },
   heroContent: {
      color: "white",
      justifyContent: "center",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      pt: 6,
      pb: 2.25,
      px: 2.25,
      borderRadius: 3,
      overflow: "hidden",
      "& #background-image": {
         zIndex: -1,
      },
      minHeight: {
         xs: 439,
         [responsiveBreakpoint]: 0,
      },
   },
   heroContentContainer: {
      zIndex: 1,
   },
   mainContent: {
      px: 2,
   },
   backgroundImgOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "black",
      opacity: 0.65,
      zIndex: -1,
   },
   title: {
      fontSize: "2.5rem !important",
      display: "inline-block",
      mb: 0.5,
   },
   subheader: {
      fontSize: "1.142rem",
   },
})

type Props = FC<{
   /*
    * Content of the dialog on the right side, bottom side on mobile
    * */
   heroContent?: ReactNode
   mainContent?: ReactNode
   handleClose?: () => void
   handleBack?: () => void
}>

const BaseDialogView: Props = ({
   heroContent,
   mainContent,
   handleClose,
   handleBack,
}) => {
   return (
      <Stack spacing={4.75} sx={styles.root}>
         {heroContent}
         {mainContent}
         {handleClose ? (
            <Box sx={styles.topRight}>
               <IconButton onClick={handleClose}>
                  <CloseIcon sx={styles.closeIcon} />
               </IconButton>
            </Box>
         ) : null}
         {handleBack ? (
            <Box sx={styles.topLeft}>
               <IconButton onClick={handleBack}>
                  <BackIcon />
               </IconButton>
            </Box>
         ) : null}
      </Stack>
   )
}

const BackAndCloseButton: FC = () => {
   const isMobile = useIsMobile()
   const { handleBack } = useLiveStreamDialog()

   if (isMobile) {
      return (
         <Box sx={styles.topLeft}>
            <IconButton onClick={handleBack}>
               <BackIcon sx={styles.closeIcon} />
            </IconButton>
         </Box>
      )
   }

   return (
      <Box sx={styles.topRight}>
         <IconButton onClick={handleBack}>
            <CloseIcon sx={styles.closeIcon} />
         </IconButton>
      </Box>
   )
}

type LeftContentProps = {
   backgroundImg?: string
   children: ReactNode
}

export const HeroContent = forwardRef<HTMLDivElement, LeftContentProps>(
   function HeroContent({ backgroundImg, children }, ref) {
      return (
         <Box id="live-stream-dialog-hero" sx={styles.heroContent} ref={ref}>
            <Container
               disableGutters
               sx={styles.heroContentContainer}
               maxWidth={"md"}
            >
               {children}
            </Container>
            {backgroundImg ? (
               <Image
                  alt={"background image"}
                  src={backgroundImg}
                  layout={"fill"}
                  objectFit={"cover"}
                  id={"background-image"}
               />
            ) : null}
            <Box sx={styles.backgroundImgOverlay} />
            <BackAndCloseButton />
         </Box>
      )
   }
)

type MainContentProps = {}

export const MainContent: FC<MainContentProps> = ({ children }) => {
   return <Box sx={styles.mainContent}>{children}</Box>
}

export default BaseDialogView
