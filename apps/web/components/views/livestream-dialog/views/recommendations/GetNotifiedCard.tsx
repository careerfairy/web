import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   Stack,
   Typography,
   useMediaQuery,
   useTheme,
} from "@mui/material"
import { styled } from "@mui/material/styles"
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

// Banner image
const BannerImage = styled(Box)(({ theme }) => ({
   width: "100%",
   backgroundColor: theme.palette.grey[300],
   backgroundSize: "cover",
   backgroundPosition: "center",
   position: "relative",
}))

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

// QR Code image
const QRCodeImage = styled(Box)(({ theme }) => ({
   width: 120,
   height: 120,
   backgroundColor: theme.palette.common.white,
   borderRadius: 12,
   backgroundSize: "contain",
   backgroundPosition: "center",
   boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
}))

interface GetNotifiedCardProps {
   /** If true, shows only calendar button. If false, shows download app and calendar buttons */
   isAppDownloaded?: boolean
   /** If true, renders the desktop version with different layouts */
   isDesktop?: boolean
   /** If true and isDesktop is true, shows the expanded version with centered content */
   isExpanded?: boolean
   /** Optional callback when close button is clicked */
   onClose?: () => void
}

export const GetNotifiedCard = ({
   isAppDownloaded = false,
   isDesktop: isDesktopProp,
   isExpanded = false,
   onClose,
}: GetNotifiedCardProps) => {
   const theme = useTheme()
   // Auto-detect desktop if not explicitly provided
   const mdUp = useMediaQuery(theme.breakpoints.up("md"))
   const isDesktop = isDesktopProp !== undefined ? isDesktopProp : mdUp

   const buttonsSize = isDesktop ? "large" : "medium"

   // Dummy handler functions
   const handleDownloadApp = () => console.log("Download app clicked")
   const handleAddToCalendar = () => console.log("Add to calendar clicked")

   return (
      <StyledCard
         sx={{
            width: isDesktop ? (isExpanded ? 570 : 402) : 343,
            height: isDesktop ? 755 : 572,
         }}
      >
         {/* Close button */}
         {Boolean(onClose) && (
            <CloseButton onClick={onClose}>
               <CloseIcon />
            </CloseButton>
         )}

         {/* Event details section */}
         <EventBanner>
            {/* Banner image with overlay */}
            <BannerImage
               sx={{
                  height: isDesktop ? 120 : 95,
                  backgroundImage:
                     "linear-gradient(rgba(22, 33, 40, 0.7), rgba(22, 33, 40, 0.7)), url('https://placehold.co/600x400')",
               }}
            />

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
                  <Avatar
                     src="https://placehold.co/80x80"
                     sx={{ width: 40, height: 40 }}
                  />
                  <Typography
                     variant="small"
                     color="text.secondary"
                     fontWeight={600}
                  >
                     EY (Ernst & Young)
                  </Typography>
               </Box>

               {/* Job title */}
               <Typography
                  variant="medium"
                  color="text.primary"
                  fontWeight={600}
                  width="100%"
                  align={isDesktop && isExpanded ? "center" : "left"}
               >
                  Technology Consulting @EY
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
                  <Typography variant="small" color="text.secondary">
                     23 March at 3:00 PM
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
            }}
         >
            <Stack spacing={2} my="auto">
               {/* Text content */}
               <Box sx={{ px: isDesktop ? 3 : 2 }}>
                  <Typography
                     variant={isDesktop ? "brandedH3" : "brandedH4"}
                     color="text.primary"
                     gutterBottom
                     align={isDesktop ? "center" : "left"}
                  >
                     {isAppDownloaded ? "Get Notified! 🎉" : "Get Notified!"}
                  </Typography>
                  <br />
                  <Typography
                     variant="medium"
                     color="text.secondary"
                     align={isDesktop ? "center" : "left"}
                  >
                     {isAppDownloaded
                        ? "Stay updated on this live stream and future job opportunities by adding this event to your calendar."
                        : "Download our mobile app to get notified when this live stream starts and stay updated on future job opportunities!"}
                  </Typography>
               </Box>

               {/* Desktop QR Code and Buttons */}
               {isDesktop && !isAppDownloaded ? (
                  <Box sx={{ px: 2 }}>
                     <QRCodeContainer>
                        <QRCodeImage
                           sx={{
                              backgroundImage:
                                 "url('https://placehold.co/120x120')",
                           }}
                        />
                        <Typography
                           variant="medium"
                           color="text.primary"
                           fontWeight={600}
                           align="center"
                        >
                           Scan to download CareerFairy App!
                        </Typography>
                        <Typography
                           variant="small"
                           color="text.disabled"
                           align="center"
                        >
                           or
                        </Typography>
                        <Button
                           variant="outlined"
                           color="primary"
                           startIcon={<CalendarIcon size={16} />}
                           onClick={handleAddToCalendar}
                           size={buttonsSize}
                           sx={{ alignSelf: "center" }}
                        >
                           Add to calendar
                        </Button>
                     </QRCodeContainer>
                  </Box>
               ) : (
                  /* Mobile Buttons or App Downloaded Buttons */
                  <Box sx={{ px: 2 }}>
                     <Stack spacing={1.5} sx={{ width: "100%" }}>
                        {!isAppDownloaded && !isDesktop && (
                           <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              startIcon={<DownloadIcon size={16} />}
                              onClick={handleDownloadApp}
                              size={buttonsSize}
                           >
                              Download app
                           </Button>
                        )}
                        <Button
                           fullWidth={!isDesktop}
                           variant={
                              isAppDownloaded
                                 ? "contained"
                                 : isDesktop
                                 ? "contained"
                                 : "outlined"
                           }
                           color="primary"
                           startIcon={<CalendarIcon size={16} />}
                           onClick={handleAddToCalendar}
                           size={buttonsSize}
                           sx={{
                              alignSelf: isDesktop ? "center" : undefined,
                              width:
                                 isDesktop && isExpanded ? "100%" : undefined,
                           }}
                        >
                           {isAppDownloaded || isDesktop
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
               <Typography variant="xsmall" color="text.disabled">
                  You&apos;ll also receive reminders on
                  hubertus.groneweegen@myemailprovider.com before the start of
                  the live stream
               </Typography>
            </Box>
         </CardContent>
      </StyledCard>
   )
}
