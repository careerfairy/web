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
   root: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FDFDFD",
      borderRadius: "16px",
      maxWidth: 770,
      overflowY: {
         sm: "auto",
      },
      minHeight: {
         sm: 694,
      },
      maxHeight: {
         sm: 694,
      },
      flex: {
         xs: 1,
         sm: 0,
      },

      p: "0px !important",
      background: "#FCFCFC",
   },
   content: {
      px: {
         xs: 2,
         sm: 4,
      },
      pt: {
         xs: 3,
         sm: 4,
      },
      pb: 3,
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
      position: "sticky",
      bottom: 0,
      borderTop: "1px solid #F0F0F0",
      mt: "auto",
      justifyContent: "flex-end",
      p: {
         xs: 2,
         sm: 0,
      },
      px: {
         sm: 4,
      },
      pt: {
         sm: 3,
      },
      pb: {
         sm: 4,
      },
      background: "inherit",
   },
})

export const View = ({ children, sx, ...props }: ContainerProps) => {
   return (
      <Container
         id="host-profile-selection-root"
         maxWidth={false}
         sx={combineStyles(styles.root, sx)}
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
