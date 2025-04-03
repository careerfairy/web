import {
   Box,
   SxProps,
   Typography,
   TypographyProps,
   styled,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/legacy/image"
import React, { useMemo } from "react"
import useColor from "use-color-thief"
import { combineStyles, sxStyles } from "../../../../types/commonTypes"

const COMPANY_LOGO_SIZE = 63

const styles = sxStyles({
   info: {
      display: "flex",
      flexDirection: "column",
   },
   logoCaptionWrapper: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      color: "white",
      height: "100%",
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
      paddingX: { xs: 1.5, md: 3.5 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "calc(100% - 35px)", // account for pagination component
      zIndex: 1,
   },
   backdrop: {
      width: "100%",
      height: "100%",
   },
   background: {
      width: "100%",
      height: "100%",
      "&:after": {
         position: "absolute",
         height: "100%",
         width: "100%",
         content: '" "',
         borderRadius: "12px",
         overflow: "hidden",
      },
      "&:before": {
         position: "absolute",
         height: "100%",
         width: "100%",
         content: '" "',
         opacity: 0.15,
         filter: "blur(10px)",
      },
   },
   image: {
      borderRadius: "12px",
      backgroundColor: "white",
   },
   actionItem: {
      mt: 2.5,
   },
})

type ContentProps = {
   headerTitle: string | React.ReactNode
   logoUrl?: string
   logoCaption?: string
   title?: string | React.ReactNode
   subtitle?: string | React.ReactNode
   actionItem?: React.ReactNode
   actionItemSx?: SxProps<DefaultTheme>
   infoSx?: SxProps<DefaultTheme>
   contentSx?: SxProps<DefaultTheme>
   backgroundImageUrl?: string
   backgroundImageAlt?: string
   withBackgroundOverlay?: boolean
   hideBackground?: boolean
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
   (
      {
         actionItem,
         headerTitle,
         logoUrl,
         logoCaption,
         subtitle,
         title,
         backgroundImageUrl,
         backgroundImageAlt,
         withBackgroundOverlay = true,
         actionItemSx,
         infoSx,
         contentSx,
         hideBackground = false,
      },
      ref
   ) => {
      const isMobile = useIsMobile()

      const { color } = useColor(backgroundImageUrl, {
         format: "rgb",
      })

      const rgb = useMemo(
         () => (Array.isArray(color) ? color.join(",") : "0, 0, 0"),
         [color]
      )

      const gradientMobile = useMemo(
         () =>
            `linear-gradient(to top,rgba(0, 0, 0, 0.45),rgba(0, 0, 0, 0.45)), linear-gradient(270deg, rgba(${rgb}, 0.00) 10.49%, rgba(${rgb}, 0.85) 52.63%)`,
         [rgb]
      )

      const gradientDesktop = useMemo(
         () =>
            `linear-gradient(to top,rgba(0, 0, 0, 0.45),rgba(0, 0, 0, 0.45)), linear-gradient(270deg, rgba(${rgb}, 0.00) 10.49%, rgba(${rgb}, 0.80) 70.32%)`,
         [rgb]
      )

      const gradient = isMobile ? gradientMobile : gradientDesktop

      return (
         <>
            {backgroundImageUrl ? (
               <Box
                  ref={ref}
                  sx={[
                     styles.background,
                     withBackgroundOverlay &&
                        color && {
                           "&:after": {
                              background: gradient,
                           },
                        },
                     backgroundImageUrl &&
                        color && {
                           "&:before": {
                              background: `${gradient}, url(${backgroundImageUrl})`,
                              backgroundSize: "cover",
                           },
                        },
                  ]}
                  position={"absolute"}
               >
                  {hideBackground ? (
                     <Box
                        position={"absolute"}
                        width={"100%"}
                        height={"100%"}
                        sx={styles.image}
                     />
                  ) : (
                     <Image
                        src={backgroundImageUrl}
                        alt={backgroundImageAlt}
                        layout="fill"
                        objectFit={"cover"}
                        quality={90}
                        style={styles.image}
                        priority
                     />
                  )}
               </Box>
            ) : null}
            <Box sx={combineStyles(styles.content, contentSx)}>
               <Stack
                  spacing={{ xs: 2, md: 2.5 }}
                  sx={combineStyles(styles.info, infoSx)}
               >
                  <ContentHeaderTitle>{headerTitle}</ContentHeaderTitle>
                  {logoUrl ? (
                     <Stack spacing={1} direction="row" marginBottom={1.5}>
                        <CircularLogo
                           src={logoUrl}
                           alt={"company logo"}
                           size={COMPANY_LOGO_SIZE}
                        />
                        {logoCaption ? (
                           <Box sx={styles.logoCaptionWrapper}>
                              <Typography fontWeight={400} variant={"xsmall"}>
                                 Hosted by
                              </Typography>
                              <Typography
                                 fontWeight={600}
                                 variant={"brandedBody"}
                                 sx={{ ...getMaxLineStyles(1) }}
                              >
                                 {logoCaption}
                              </Typography>
                           </Box>
                        ) : null}
                     </Stack>
                  ) : null}
                  {title ? (
                     <Stack mt={"12px !important"}>
                        <ContentTitle sx={styles.title}>{title}</ContentTitle>
                     </Stack>
                  ) : null}
                  {subtitle ? (
                     <ContentSubtitle sx={{ mb: 1.5, mt: "12px !important" }}>
                        {subtitle}
                     </ContentSubtitle>
                  ) : null}

                  {actionItem ? (
                     <Box sx={combineStyles(styles.actionItem, actionItemSx)}>
                        {actionItem}
                     </Box>
                  ) : null}
               </Stack>
            </Box>
         </>
      )
   }
)

Content.displayName = "Content"

export const ContentSubtitle = styled((props: TypographyProps) => (
   <Typography variant={"small"} {...props} />
))(() => ({
   fontWeight: "400",
   mt: 1,
})) as typeof Typography

export const ContentHeaderTitle = styled((props: TypographyProps) => (
   <Typography variant={"brandedH4"} {...props} />
))(() => ({
   fontWeight: 600,
   position: "relative",
   display: "inline-block",
   mb: 0.5,
})) as typeof Typography

export const ContentTitle = styled((props: TypographyProps) => (
   <Typography variant={"brandedH3"} {...props} />
))(() => ({
   display: "inline-block",
   fontWeight: "bold",
   whiteSpace: "pre-line",
})) as typeof Typography

export default Content
