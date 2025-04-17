import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   Stack,
   Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
   Calendar as CalendarIcon,
   X as CloseIcon,
   Download as DownloadIcon,
} from "react-feather"

// Card container
const StyledCard = styled(Card)(({ theme }) => ({
   backgroundColor: theme.palette.common.white,
   borderRadius: 16,
   boxShadow: "none",
   padding: 0,
   maxWidth: 343,
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
   height: 160,
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
   zIndex: 1,
}))

interface GetNotifiedCardProps {
   /** If true, shows only calendar button. If false, shows download app and calendar buttons */
   isAppDownloaded?: boolean
   /** Optional callback when close button is clicked */
   onClose?: () => void
}

export const GetNotifiedCard = ({
   isAppDownloaded = false,
   onClose,
}: GetNotifiedCardProps) => {
   // Dummy handler functions
   const handleDownloadApp = () => console.log("Download app clicked")
   const handleAddToCalendar = () => console.log("Add to calendar clicked")
   const handleClose = () => {
      console.log("Close clicked")
      onClose?.()
   }

   return (
      <StyledCard>
         {/* Close button */}
         <CloseButton onClick={handleClose}>
            <CloseIcon />
         </CloseButton>

         {/* Event details section */}
         <EventBanner>
            {/* Banner image with overlay */}
            <BannerImage
               sx={{
                  backgroundImage:
                     "linear-gradient(rgba(22, 33, 40, 0.7), rgba(22, 33, 40, 0.7)), url('https://placehold.co/600x400')",
               }}
            />

            {/* Event content */}
            <Box
               sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
         <CardContent sx={{ px: 0 }}>
            <Stack spacing={2}>
               {/* Text content */}
               <Box sx={{ px: 2 }}>
                  <Typography
                     variant="brandedH4"
                     color="text.primary"
                     gutterBottom
                  >
                     {isAppDownloaded ? "Get Notified! 🎉" : "Get Notified!"}
                  </Typography>
                  <Typography variant="medium" color="text.secondary">
                     {isAppDownloaded
                        ? "Stay updated on this live stream and future job opportunities by adding this event to your calendar."
                        : "Download our mobile app to get notified when this live stream starts and stay updated on future job opportunities!"}
                  </Typography>
               </Box>

               {/* Buttons */}
               <Box sx={{ px: 2 }}>
                  <Stack spacing={1.5}>
                     {!isAppDownloaded && (
                        <Button
                           fullWidth
                           variant="contained"
                           color="primary"
                           startIcon={<DownloadIcon size={16} />}
                           onClick={handleDownloadApp}
                        >
                           Download app
                        </Button>
                     )}
                     <Button
                        fullWidth
                        variant={isAppDownloaded ? "contained" : "outlined"}
                        color="primary"
                        startIcon={<CalendarIcon size={16} />}
                        onClick={handleAddToCalendar}
                     >
                        {isAppDownloaded
                           ? "Add to calendar"
                           : "Add live stream to calendar"}
                     </Button>
                  </Stack>
               </Box>

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
                     hubertus.groneweegen@myemailprovider.com before the start
                     of the live stream
                  </Typography>
               </Box>
            </Stack>
         </CardContent>
      </StyledCard>
   )
}
