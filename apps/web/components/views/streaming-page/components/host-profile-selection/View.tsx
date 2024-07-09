import {
   Box,
   BoxProps,
   Container,
   ContainerProps,
   Stack,
   Typography,
   TypographyProps,
} from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      p: "0px !important",
      background: "#FCFCFC",
   },
   containerDesktop: {
      borderRadius: "16px",
      overflow: "auto",
      height: 720,
      maxHeight: 720,
      maxWidth: 770,
      display: "flex",
      flexDirection: "column",
   },
   containerMobile: {
      marginTop: "auto",
      maxHeight: "calc(100dvh - 70px)",
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
   },
   content: {
      background: "inherit",
      px: {
         xs: 2,
         tablet: 4,
      },
      pt: {
         xs: 3,
         tablet: 4,
      },
      pb: 3,
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   title: (theme) => ({
      color: theme.palette.common.black,
      fontWeight: 700,
      textAlign: "center",
   }),
   subtitle: {
      color: "neutral.700",
      textAlign: "center",
   },
   actions: {
      zIndex: 1,
      position: "sticky",
      bottom: 0,
      borderTop: "1px solid #F0F0F0",
      mt: "auto",
      justifyContent: "flex-end",
      p: {
         xs: 2,
         tablet: 0,
      },
      px: {
         tablet: 4,
      },
      pt: {
         tablet: 3,
      },
      pb: {
         tablet: 4,
      },
      background: "inherit",
   },
})

export const View = ({ children, sx, ...props }: ContainerProps) => {
   const streamIsMobile = useStreamIsMobile()

   return (
      <Container
         id="host-profile-selection-root"
         maxWidth={false}
         sx={combineStyles(
            [
               styles.container,
               streamIsMobile
                  ? styles.containerMobile
                  : styles.containerDesktop,
            ],
            sx
         )}
         {...props}
      >
         {children}
      </Container>
   )
}

const Content = ({ children, ...props }: BoxProps) => {
   return (
      <Box id="host-profile-selection-content" sx={styles.content} {...props}>
         {children}
      </Box>
   )
}

const Title = ({ children, ...props }: TypographyProps) => {
   const streamIsMobile = useStreamIsMobile()

   return (
      <Typography
         id="host-profile-selection-title"
         sx={styles.title}
         variant={streamIsMobile ? "mobileBrandedH2" : "desktopBrandedH2"}
         component="h1"
         {...props}
      >
         {children}
      </Typography>
   )
}

const Subtitle = ({ children, ...props }: TypographyProps) => {
   return (
      <Typography
         id="host-profile-selection-subtitle"
         sx={styles.subtitle}
         component="p"
         variant="medium"
         {...props}
      >
         {children}
      </Typography>
   )
}

const Actions = ({ children }: { children: ReactNode }) => {
   return (
      <Stack
         id="host-profile-selection-actions"
         direction="row"
         spacing={1.5}
         sx={styles.actions}
      >
         {children}
      </Stack>
   )
}

View.Content = Content
View.Title = Title
View.Subtitle = Subtitle
View.Actions = Actions
