import { FC, ReactNode } from "react"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../types/commonTypes"
import { Box, IconButton, Typography, TypographyProps } from "@mui/material"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import Image from "next/legacy/image"

const responsiveBreakpoint = "md"

const styles = sxStyles({
   root: {
      height: {
         xs: "100%",
         [responsiveBreakpoint]: 315,
      },
      width: "100%",
      position: "relative",
   },
   content: {
      px: 5,
      py: 4,
   },
   leftContent: {
      pt: {
         xs: 6,
         [responsiveBreakpoint]: undefined,
      },
      textAlign: {
         xs: "center",
         [responsiveBreakpoint]: "left",
      },
      justifyContent: "center",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      flex: {
         xs: "0.4",
         [responsiveBreakpoint]: "0.5",
      },
      backgroundColor: (theme) => theme.palette.grey[100],
   },
   rightContent: {
      flex: {
         xs: "0.6",
         [responsiveBreakpoint]: "0.5",
      },
      position: "relative",
      display: "flex",
      alignItems: {
         [responsiveBreakpoint]: "center",
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
      color: {
         xs: "white",
         [responsiveBreakpoint]: "text.primary",
      },
   },
   backgroundImgOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "black",
      opacity: 0.85,
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
   rightContent: ReactNode
   leftContent: ReactNode
   handleClose?: () => void
   handleBack?: () => void
}>

const BaseDialogView: Props = ({
   rightContent,
   leftContent,
   handleClose,
   handleBack,
}) => {
   return (
      <Stack
         direction={{
            xs: "column",
            [responsiveBreakpoint]: "row",
         }}
         sx={styles.root}
      >
         {leftContent}
         {rightContent}
         {handleClose ? (
            <Box sx={styles.topRight}>
               <IconButton onClick={handleClose}>
                  <CloseIcon sx={styles.closeIcon} />
               </IconButton>
            </Box>
         ) : null}
         {handleBack ? (
            <Box sx={styles.topLeft}>
               <IconButton
                  data-testid="credits-dialog-back-button"
                  onClick={handleBack}
               >
                  <BackIcon />
               </IconButton>
            </Box>
         ) : null}
      </Stack>
   )
}

type LeftContentProps = {
   backgroundColor?: string
   backgroundImg?: string
   title: ReactNode
   subHeader: ReactNode
}
export const LeftContent: FC<LeftContentProps> = ({
   title,
   subHeader,
   backgroundImg,
   backgroundColor,
}) => {
   return (
      <Box
         sx={[
            styles.leftContent,
            styles.content,
            backgroundColor && {
               backgroundColor,
            },
         ]}
      >
         {backgroundImg ? (
            <>
               <Image
                  alt={"background image"}
                  src={backgroundImg}
                  layout={"fill"}
                  objectFit={"cover"}
               />
               <Box sx={styles.backgroundImgOverlay} />
            </>
         ) : null}
         {title}
         {subHeader}
      </Box>
   )
}

type RightContentProps = {
   backgroundColor?: string
   children: React.ReactNode
}

export const RightContent: FC<RightContentProps> = ({
   children,
   backgroundColor,
}) => {
   return (
      <Box
         sx={[
            styles.rightContent,
            styles.content,
            backgroundColor && {
               backgroundColor,
            },
         ]}
      >
         {children}
      </Box>
   )
}

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
