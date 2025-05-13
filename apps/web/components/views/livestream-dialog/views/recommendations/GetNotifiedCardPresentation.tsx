import {
   Box,
   Button,
   Card,
   CardContent,
   Stack,
   Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { motion } from "framer-motion"
import Image from "next/image"
import { ComponentProps, SyntheticEvent } from "react"
import {
   Calendar as CalendarIcon,
   X as CloseIcon,
   Download as DownloadIcon,
} from "react-feather"
import { combineStyles } from "types/commonTypes"

// Card container
const StyledCard = styled(motion(Card))(({ theme }) => ({
   position: "relative",
   backgroundColor: theme.palette.common.white,
   borderRadius: 16,
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
   padding: 0,
   maxWidth: 343,
   display: "flex",
   flexDirection: "column",
   flexGrow: 1,
   minHeight: "fit-content",
   flexShrink: 0,
   transition: theme.transitions.create(["width", "height"], {
      duration: 300,
      easing: "ease-in-out",
   }),
   [theme.breakpoints.up("md")]: {
      maxWidth: "none",
      width: "auto",
   },
}))

export type CardProps = ComponentProps<typeof StyledCard>

// Event details section
const EventBanner = styled(Box)(({ theme }) => ({
   backgroundColor: theme.palette.background.paper,
   borderRadius: 14,
   display: "flex",
   flexDirection: "column",
}))

const EventBannerLowerContentContainer = styled(motion(Box))(({ theme }) => ({
   display: "flex",
   flexDirection: "column",
   gap: 8,
   padding: "8px 16px",
   borderBottomRightRadius: "14px",
   borderBottomLeftRadius: "14px",
   borderWidth: 1,
   borderColor: theme.brand.white[500],
   backgroundColor: theme.brand.white[200],
   borderStyle: "solid",
}))

// Banner image container
const BannerImageContainer = styled(Box)(({ theme }) => ({
   width: "100%",
   position: "relative",
   backgroundColor: theme.palette.grey[300],
}))

// Gradient overlay
const GradientOverlay = styled(Box)({
   position: "absolute",
   inset: 0,
   zIndex: 1,
   background: "linear-gradient(rgba(22, 33, 40, 0.7), rgba(22, 33, 40, 0.7))",
})

// Close button
const CloseButton = styled(Box)(({ theme }) => ({
   position: "absolute",
   top: 12,
   right: 12,
   cursor: "pointer",
   color: theme.palette.common.white,
   zIndex: 10,
}))

// QR Code container
const QRCodeContainer = styled(Box)({
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: 12,
   padding: 16,
   backgroundColor: "#F1FCF9",
   borderRadius: 17,
   border: "1px solid #95DDD2",
   alignSelf: "stretch",
})

// QR Code image using styled(Image)
const StyledQRCodeImage = styled(motion(Image))(({ theme }) => ({
   width: 120,
   height: 120,
   backgroundColor: theme.palette.common.white,
   borderRadius: 12,
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
   padding: 6,
}))

const AnimatedCircularLogo = motion(CircularLogo)
const AnimatedCalendarIcon = motion(CalendarIcon)
const AnimatedTypography = motion(Typography)

/** Props for the presentation component that handles UI */
type Props = {
   /** Company name to display */
   companyName: string
   /** Company logo URL */
   companyLogoUrl: string
   /** Job title or event title */
   title: string
   /** Banner image URL */
   bannerImageUrl: string
   /** Formatted event date string */
   eventDateString: string
   /** QR code image URL */
   qrCodeUrl: string
   /** If true, shows download app button. If false, shows only calendar button */
   shouldDownloadApp: boolean
   /** If true, shows desktop layout. If false, shows mobile layout */
   isDesktop: boolean
   /** If true and isDesktop is true, shows the expanded version with centered content */
   isExpanded: boolean
   /** User's email for notification details */
   userEmail: string
   /** Handler for add to calendar button click */
   onAddToCalendar: (event: SyntheticEvent) => void
   /** Optional callback when close button is clicked */
   onClose?: () => void
   /** Href for the download app button */
   downloadAppHref?: string
   /** If true, animate layout */
   animateLayout?: boolean
} & CardProps

/**
 * Presentation component for the GetNotifiedCard.
 * This component is responsible only for rendering the UI based on props.
 */
export const GetNotifiedCardPresentation = ({
   companyName,
   companyLogoUrl,
   title,
   bannerImageUrl,
   eventDateString,
   qrCodeUrl,
   shouldDownloadApp,
   isDesktop,
   isExpanded,
   userEmail,
   onAddToCalendar,
   onClose,
   downloadAppHref,
   sx,
   animateLayout,
   ...cardProps
}: Props) => {
   const buttonsSize = isDesktop ? "large" : "medium"

   const getCardMaxHeight = () => {
      if (isDesktop) {
         return shouldDownloadApp ? 755 : 706
      } else {
         return shouldDownloadApp ? 572 : 534
      }
   }

   return (
      <StyledCard
         data-testid="get-notified-card"
         sx={combineStyles(
            {
               width: `${
                  isDesktop ? (isExpanded ? 570 : 402) : 343
               }px !important`,
               maxHeight: getCardMaxHeight(),
            },
            sx
         )}
         {...cardProps}
      >
         {/* Close button */}
         {Boolean(onClose) && !isDesktop && (
            <CloseButton onClick={onClose}>
               <CloseIcon />
            </CloseButton>
         )}

         {/* Event details section */}
         <EventBanner>
            {/* Banner image with overlay */}
            <BannerImageContainer sx={{ height: isDesktop ? 120 : 95 }}>
               <Image
                  src={bannerImageUrl}
                  alt="Event banner"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes={isDesktop ? "402px" : "343px"}
               />
               <GradientOverlay />
            </BannerImageContainer>

            {/* Event content */}
            <EventBannerLowerContentContainer
               layout={animateLayout}
               alignItems={isDesktop && isExpanded ? "center" : "flex-start"}
            >
               {/* Company info */}
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     width: "100%",
                     gap: 1,
                     justifyContent:
                        isDesktop && isExpanded ? "center" : "flex-start",
                  }}
               >
                  <AnimatedCircularLogo
                     layout={animateLayout}
                     src={companyLogoUrl}
                     alt={`${companyName} logo`}
                     size={28}
                  />
                  <Typography
                     component={motion.div}
                     layout={animateLayout}
                     variant="small"
                     color="text.secondary"
                     fontWeight={600}
                     sx={getMaxLineStyles(1)}
                  >
                     {companyName}
                  </Typography>
               </Box>

               {/* Job title */}
               <AnimatedTypography
                  layout={animateLayout}
                  variant="medium"
                  color="text.primary"
                  fontWeight={600}
                  width="100%"
                  align={isDesktop && isExpanded ? "center" : "left"}
                  sx={getMaxLineStyles(1)}
               >
                  {title}
               </AnimatedTypography>

               {/* Event date */}
               <Box
                  component={motion.div}
                  layout={animateLayout}
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     width: "100%",
                     gap: 1,
                     justifyContent:
                        isDesktop && isExpanded ? "center" : "flex-start",
                  }}
               >
                  <AnimatedCalendarIcon layout size={16} color="#5C5C6A" />
                  <AnimatedTypography
                     layout={animateLayout}
                     sx={getMaxLineStyles(1)}
                     variant="small"
                     color="text.secondary"
                  >
                     {eventDateString}
                  </AnimatedTypography>
               </Box>
            </EventBannerLowerContentContainer>
         </EventBanner>

         {/* Call to action section */}
         <CardContent
            sx={{
               px: 0,
               py: 0,
               flexGrow: 1,
               pb: "0px !important",
               display: "flex",
               flexDirection: "column",
               width: "100%",
            }}
         >
            <Stack
               spacing={2}
               py={2}
               m="auto"
               display="flex"
               maxWidth={!shouldDownloadApp ? 434 : undefined}
            >
               {/* Text content */}
               <Stack
                  px={isDesktop ? 3 : 2}
                  textAlign={isDesktop && isExpanded ? "center" : "left"}
                  spacing={0.5}
               >
                  <AnimatedTypography
                     layout={animateLayout}
                     variant={isDesktop ? "brandedH3" : "brandedH4"}
                     color="text.primary"
                     fontWeight={700}
                  >
                     {!shouldDownloadApp ? "Get Notified! 🎉" : "Get Notified!"}
                  </AnimatedTypography>
                  <AnimatedTypography
                     layout={animateLayout}
                     variant="medium"
                     color="text.secondary"
                  >
                     {!shouldDownloadApp
                        ? "Stay updated on this live stream and future job opportunities by adding this event to your calendar."
                        : "Download our mobile app to get notified when this live stream starts and stay updated on future job opportunities!"}
                  </AnimatedTypography>
               </Stack>

               {/* Desktop QR Code and Buttons */}
               {isDesktop && shouldDownloadApp ? (
                  <Box sx={{ px: 2 }}>
                     <QRCodeContainer
                        sx={{
                           alignItems:
                              isDesktop && isExpanded ? "center" : "flex-start",
                        }}
                     >
                        <StyledQRCodeImage
                           // @ts-ignore
                           layout={animateLayout}
                           src={qrCodeUrl}
                           alt="QR Code to download CareerFairy App"
                           width={120}
                           height={120}
                           quality={100}
                           style={{ objectFit: "contain" }}
                        />
                        <Stack
                           alignItems={
                              isDesktop && isExpanded ? "center" : "flex-start"
                           }
                           spacing={0.5}
                        >
                           <AnimatedTypography
                              layout={animateLayout}
                              variant="desktopBrandedH5"
                              color="text.primary"
                              fontWeight={600}
                           >
                              Scan to download CareerFairy App!
                           </AnimatedTypography>
                           <AnimatedTypography
                              layout={animateLayout}
                              variant="small"
                              color="neutral.600"
                              align="center"
                           >
                              or
                           </AnimatedTypography>
                           <Button
                              component={motion.div}
                              layout={animateLayout}
                              variant="outlined"
                              color="primary"
                              startIcon={<CalendarIcon size={16} />}
                              onClick={onAddToCalendar}
                              size="small"
                           >
                              Add to calendar
                           </Button>
                        </Stack>
                     </QRCodeContainer>
                  </Box>
               ) : (
                  /* Mobile Buttons or App Downloaded Buttons */
                  <Box sx={{ px: 2 }}>
                     <Stack spacing={1.5} sx={{ width: "100%" }}>
                        {Boolean(shouldDownloadApp && !isDesktop) && (
                           <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              startIcon={<DownloadIcon size={16} />}
                              href={downloadAppHref}
                              target="_blank"
                              size={buttonsSize}
                           >
                              Download app
                           </Button>
                        )}
                        <Button
                           variant={
                              !shouldDownloadApp
                                 ? "contained"
                                 : isDesktop
                                 ? "contained"
                                 : "outlined"
                           }
                           color="primary"
                           startIcon={<CalendarIcon size={16} />}
                           onClick={onAddToCalendar}
                           size={buttonsSize}
                           fullWidth
                        >
                           {!shouldDownloadApp || isDesktop
                              ? "Add to calendar"
                              : "Add live stream to calendar"}
                        </Button>
                     </Stack>
                  </Box>
               )}
            </Stack>

            {/* Email notification info */}
            <Box
               sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  px: 2,
                  py: 1,
               }}
            >
               {Boolean(userEmail) && (
                  <Typography variant="xsmall" color="neutral.500">
                     You&apos;ll also receive reminders at {userEmail} before
                     the start of the live stream
                  </Typography>
               )}
            </Box>
         </CardContent>
      </StyledCard>
   )
}
