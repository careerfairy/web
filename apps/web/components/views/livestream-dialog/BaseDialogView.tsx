import { FC, forwardRef, ReactNode } from "react"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../types/commonTypes"
import { Box, Container, IconButton } from "@mui/material"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import Image from "next/image"
import { useMeasure } from "react-use"
import { SxProps } from "@mui/system"
import { DefaultTheme } from "@mui/styles/defaultTheme"

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
   noMinHeight: {
      minHeight: "0px !important",
   },
   heroContentContainer: {
      zIndex: 1,
   },
   mainContent: {
      px: 2,
      position: "relative",
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
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
      display: "flex",
   },
})

type Props = FC<{
   /*
    * Content of the dialog on the right side, bottom side on mobile
    * */
   heroContent?: ReactNode
   mainContent?: ReactNode
   fixedBottomContent?: ReactNode
   handleClose?: () => void
   handleBack?: () => void
   sx?: SxProps<DefaultTheme>
}>

const BaseDialogView: Props = ({
   heroContent,
   mainContent,
   fixedBottomContent,
   handleClose,
   handleBack,
   sx,
}) => {
   const [ref, { height }] = useMeasure()

   return (
      <>
         <Stack
            spacing={4.75}
            sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
         >
            {heroContent}
            {mainContent}
            {handleClose ? (
               <Box sx={styles.topRight}>
                  <IconButton onClick={handleClose}>
                     <CloseIcon color="inherit" sx={styles.closeIcon} />
                  </IconButton>
               </Box>
            ) : null}
            {handleBack ? (
               <Box sx={styles.topLeft}>
                  <IconButton onClick={handleBack}>
                     <BackIcon color="inherit" />
                  </IconButton>
               </Box>
            ) : null}
         </Stack>
         {fixedBottomContent ? (
            <>
               <FixedBottomContent ref={ref}>
                  {fixedBottomContent}
               </FixedBottomContent>
               <Box height={`calc(${height}px + 40px)`} />
            </>
         ) : null}
      </>
   )
}

type BackAndCloseButtonProps = {
   onBackClick?: () => void
   onBackPosition?: "top-left" | "top-right"
   color?: string
}

const BackAndCloseButton: FC<BackAndCloseButtonProps> = ({
   onBackClick,
   onBackPosition,
   color,
}) => {
   const colorStyle = color ? { color } : {}

   if (!onBackClick) return null

   if (onBackPosition === "top-left") {
      return (
         <Box color={color} sx={styles.topLeft}>
            <IconButton onClick={onBackClick}>
               <BackIcon sx={[styles.closeIcon, colorStyle]} />
            </IconButton>
         </Box>
      )
   }

   return (
      <Box color={color} sx={styles.topRight}>
         <IconButton onClick={onBackClick}>
            <CloseIcon sx={[styles.closeIcon, colorStyle]} />
         </IconButton>
      </Box>
   )
}

type LeftContentProps = {
   backgroundImg?: string
   children: ReactNode
   noMinHeight?: boolean
} & BackAndCloseButtonProps

export const HeroContent = forwardRef<HTMLDivElement, LeftContentProps>(
   function HeroContent(
      { backgroundImg, children, onBackClick, onBackPosition, noMinHeight },
      ref
   ) {
      return (
         <Box
            id="live-stream-dialog-hero"
            sx={[styles.heroContent, noMinHeight && styles.noMinHeight]}
            ref={ref}
         >
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
            <BackAndCloseButton
               onBackClick={onBackClick}
               onBackPosition={onBackPosition}
               color={"white"}
            />
         </Box>
      )
   }
)

type FixedBottomContentProps = {
   children: ReactNode
}
export const FixedBottomContent = forwardRef<
   HTMLDivElement,
   FixedBottomContentProps
>(function FixedBottomContent({ children }, ref) {
   return (
      <Box ref={ref} sx={styles.fixedBottomContent}>
         {children}
      </Box>
   )
})

type MainContentProps = {
   sx?: SxProps<DefaultTheme>
} & BackAndCloseButtonProps

export const MainContent: FC<MainContentProps> = ({
   children,
   onBackClick,
   onBackPosition,
   sx,
}) => {
   return (
      <Box sx={[styles.mainContent, ...(Array.isArray(sx) ? sx : [sx])]}>
         {children}
         <BackAndCloseButton
            onBackClick={onBackClick}
            onBackPosition={onBackPosition}
            color={"black"}
         />
      </Box>
   )
}

export default BaseDialogView
