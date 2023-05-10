import { FC, ReactNode } from "react"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../types/commonTypes"
import {
   Box,
   Container,
   IconButton,
   Typography,
   TypographyProps,
} from "@mui/material"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import Image from "next/image"

const responsiveBreakpoint = "md"

const styles = sxStyles({
   root: {
      p: 2.25,
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
      color: {
         xs: "white",
         [responsiveBreakpoint]: "text.primary",
      },
   },
   heroContent: {
      color: "white",
      justifyContent: "center",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      py: 6,
      px: 2.25,
      borderRadius: 3,
      overflow: "hidden",
      "& #background-image": {
         zIndex: -1,
      },
   },
   heroContentContainer: {
      zIndex: 1,
   },
   mainContent: {},
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
      <Stack sx={styles.root}>
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

type LeftContentProps = {
   backgroundImg?: string
}
export const HeroContent: FC<LeftContentProps> = ({
   backgroundImg,
   children,
}) => {
   return (
      <Box sx={styles.heroContent}>
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
      </Box>
   )
}

type RightContentProps = {
   backgroundColor?: string
}

// export const RightContent: FC<RightContentProps> = ({
//    children,
//    backgroundColor,
// }) => {
//    return (
//       <Box
//          sx={[
//             styles.rightContent,
//             styles.content,
//             backgroundColor && {
//                backgroundColor,
//             },
//          ]}
//       >
//          {children}
//       </Box>
//    )
// }

export const TitleText: FC<TypographyProps> = (props) => {
   return (
      <Typography
         variant="h3"
         fontWeight={600}
         position="relative"
         sx={styles.title}
         {...props}
      />
   )
}

export const SubHeaderText: FC<TypographyProps> = (props) => {
   return (
      <Typography
         position="relative"
         sx={styles.subheader}
         variant={"body1"}
         {...props}
      />
   )
}

export default BaseDialogView
