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
import Image from "next/image"
import { SyntheticEvent } from "react"
import {
   Calendar as CalendarIcon,
   X as CloseIcon,
   Download as DownloadIcon,
} from "react-feather"

// Card container
const StyledCard = styled(Card)(({ theme }) => ({
   position: "relative",
   backgroundColor: theme.palette.common.white,
   borderRadius: 16,
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
   padding: 0,
   maxWidth: 343,
   display: "flex",
   flexDirection: "column",
   [theme.breakpoints.up("md")]: {
      maxWidth: "none",
      width: "auto",
   },
}))

// Event details section
const EventBanner = styled(Box)(({ theme }) => ({
   backgroundColor: theme.palette.background.paper,
   borderRadius: 14,
   borderColor: theme.palette.divider,
   borderWidth: 1,
   borderStyle: "solid",
   padding: "0 0 8px 0",
   display: "flex",
   flexDirection: "column",
   gap: 8,
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
const StyledQRCodeImage = styled(Image)(({ theme }) => ({
   width: 120,
   height: 120,
   backgroundColor: theme.palette.common.white,
   borderRadius: 12,
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
   padding: 6,
}))

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
}

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
}: Props) => {
   const buttonsSize = isDesktop ? "large" : "medium"

   return (
      <StyledCard
         sx={{
            width: `${isDesktop ? (isExpanded ? 570 : 402) : 343}px !important`,
         }}
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
            <Box
               sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isDesktop && isExpanded ? "center" : "flex-start",
                  px: 2,
                  gap: 1,
               }}
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
                  <CircularLogo
                     src={companyLogoUrl}
                     alt={`${companyName} logo`}
                     size={28}
                  />
                  <Typography
                     variant="small"
                     color="text.secondary"
                     fontWeight={600}
                     sx={getMaxLineStyles(1)}
                  >
                     {companyName}
                  </Typography>
               </Box>

               {/* Job title */}
               <Typography
                  variant="medium"
                  color="text.primary"
                  fontWeight={600}
                  width="100%"
                  align={isDesktop && isExpanded ? "center" : "left"}
                  sx={getMaxLineStyles(1)}
               >
                  {title}
               </Typography>

               {/* Event date */}
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
                  <CalendarIcon size={16} color="#5C5C6A" />
                  <Typography
                     sx={getMaxLineStyles(1)}
                     variant="small"
                     color="text.secondary"
                  >
                     {eventDateString}
                  </Typography>
               </Box>
            </Box>
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
               <Box
                  px={isDesktop ? 3 : 2}
                  textAlign={isDesktop && isExpanded ? "center" : "left"}
               >
                  <Typography
                     variant={isDesktop ? "brandedH3" : "brandedH4"}
                     color="text.primary"
                     gutterBottom
                     fontWeight={700}
                  >
                     {!shouldDownloadApp ? "Get Notified! 🎉" : "Get Notified!"}
                  </Typography>
                  <br />
                  <Typography variant="medium" color="text.secondary">
                     {!shouldDownloadApp
                        ? "Stay updated on this live stream and future job opportunities by adding this event to your calendar."
                        : "Download our mobile app to get notified when this live stream starts and stay updated on future job opportunities!"}
                  </Typography>
               </Box>

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
                           <Typography
                              variant="desktopBrandedH5"
                              color="text.primary"
                              fontWeight={600}
                           >
                              Scan to download CareerFairy App!
                           </Typography>
                           <Typography
                              variant="small"
                              color="neutral.600"
                              align="center"
                           >
                              or
                           </Typography>
                           <Button
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
