import {
   Box,
   Container,
   Typography,
   TypographyProps,
   darken,
   styled,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import Image from "next/image"
import React, { FC, Fragment } from "react"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   info: {
      marginTop: 4,
      display: "flex",
      flexDirection: "column",
   },
   logoWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 88,
      height: 48,
      p: [1, 1.5],
      backgroundColor: "white",
      borderRadius: 1.5,
   },
   subtitle: {
      fontWeight: "400",
      color: "white",
      mt: 1,
   },
   title: {
      maxWidth: {
         xs: "100%",
         md: "80%",
         lg: "60%",
      },
   },
   content: {
      position: "relative",
      paddingX: { xs: 2.62, md: 6.25 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      zIndex: 1,
   },
   wrapper: {
      width: "100%",
      height: { xs: "55vh", md: "40vh" },
      minHeight: "470px",
   },
   image: {
      "&:after": {
         position: "absolute",
         height: "100%",
         width: "100%",
         content: '" "',
         opacity: 0.7,
      },
   },
   backgroundOverlay: {
      "&:after": {
         backgroundColor: (theme) => darken(theme.palette.navyBlue.main, 0.5),
      },
   },
})

type ContentProps = {
   headerTitle: string | React.ReactNode
   logoUrl?: string
   title?: string | React.ReactNode
   subtitle?: string | React.ReactNode
   actionItem?: React.ReactNode
   backgroundImageUrl?: string
   backgroundImageAlt?: string
   withBackgroundOverlay?: boolean
}

const Content: FC<ContentProps> = ({
   actionItem,
   headerTitle,
   logoUrl,
   subtitle,
   title,
   backgroundImageUrl,
   backgroundImageAlt,
   withBackgroundOverlay = true,
}) => {
   return (
      <Fragment>
         {backgroundImageUrl ? (
            <Box
               sx={[
                  styles.wrapper,
                  styles.image,
                  withBackgroundOverlay && styles.backgroundOverlay,
               ]}
               position={"absolute"}
            >
               <Image
                  src={backgroundImageUrl}
                  alt={backgroundImageAlt}
                  layout="fill"
                  objectFit="cover"
                  quality={90}
               />
            </Box>
         ) : null}
         <Container disableGutters sx={styles.content}>
            <Box sx={styles.info}>
               <Stack spacing={1.5} mt={4}>
                  <ContentHeaderTitle>{headerTitle}</ContentHeaderTitle>
                  {logoUrl ? (
                     <Box sx={styles.logoWrapper} mt={2}>
                        <Image
                           objectFit="contain"
                           quality={90}
                           src={logoUrl}
                           alt={"company logo"}
                           width={200}
                           height={100}
                        />
                     </Box>
                  ) : null}
                  <ContentTitle sx={styles.title} component="h2">
                     {title}
                  </ContentTitle>
                  <ContentSubtitle component="h3">{subtitle}</ContentSubtitle>
               </Stack>
               {actionItem ? <Box mt={2}>{actionItem}</Box> : null}
            </Box>
         </Container>
      </Fragment>
   )
}

export const ContentSubtitle = styled((props: TypographyProps) => (
   <Typography variant={"h6"} {...props} />
))(() => ({
   fontWeight: "400",
   mt: 1,
})) as typeof Typography

export const ContentHeaderTitle = styled((props: TypographyProps) => (
   <Typography variant={"h1"} {...props} />
))(({ theme }) => ({
   fontWeight: 600,
   position: "relative",
   display: "inline-block",
   mb: 0.5,
   fontSize: "2.375rem",
   [theme.breakpoints.up("md")]: {
      fontSize: "3.6rem !important",
   },
})) as typeof Typography

export const ContentTitle = styled((props: TypographyProps) => (
   <Typography {...props} />
))(({ theme }) => ({
   display: "inline-block",
   fontWeight: "bold",
   whiteSpace: "pre-line",
   fontSize: "1.28rem",
   [theme.breakpoints.up("md")]: {
      fontSize: "2rem",
   },
})) as typeof Typography

export default Content
