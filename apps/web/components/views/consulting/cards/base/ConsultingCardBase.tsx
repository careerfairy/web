import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   Avatar,
   Box,
   Chip,
   Stack,
   SxProps,
   Theme,
   Typography,
   useTheme,
} from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/router"
import { CheckCircle } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import { CalendarDate } from "../../../common/stream-cards/CalendarDate"
import { buildDialogLink } from "../../../livestream-dialog/util"

const styles = sxStyles({
   consultingCard: {
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.2s ease-in-out",
      "&:hover": {
         "& .consultingBackground": {
            transform: "scale(1.05)",
         },
      },
   },
   consultingBackground: {
      position: "absolute",
      inset: "-3.36% -3.37%",
      backgroundSize: "cover",
      backgroundPosition: "right center",
      borderRadius: "12px",
      transition: "transform 0.3s ease-in-out",
      "&::before": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: `
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%),
            linear-gradient(rgba(0, 0, 0, 0) 65.561%, rgba(0, 0, 0, 0.38) 100%)
         `,
         borderRadius: "12px",
      },
      "&::after": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: `
            radial-gradient(circle at 6.2438px 122.6px, rgba(10, 8, 3, 1) 0%, rgba(10, 8, 3, 0) 100%)
         `,
         borderRadius: "12px",
      },
   },
   avatarsContainer: {
      display: "flex",
      gap: 0.5,
      alignItems: "center",
   },
   avatar: {
      borderRadius: "70px",
   },
   dateBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      borderRadius: "6px 6px 6px 0",
      p: "12px 12px 16px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "40px",
   },
   dateBadgeSmall: {
      color: (theme) => theme.brand.white[100],
      "& .MuiChip-label": {
         p: "0px 8px",
      },
      height: "fit-content",
      borderRadius: "20px",
      background: "rgba(255, 255, 255, 0.50)",
      boxShadow: "0 0 12px 0 rgba(20, 20, 20, 0.08)",
      backdropFilter: "blur(10px)",
   },
   registrationBadge: {
      "& .MuiChip-label:empty": { paddingLeft: 0 },
      "& .MuiChip-label": { paddingLeft: "10px" },
      width: "24px",
      height: "24px",
      backgroundColor: (theme) => theme.brand.white[200],
      borderRadius: "60px",
   },
})

type ConsultingCardBase = {
   event: LivestreamEvent
   children: React.ReactNode
   rootSx?: SxProps<Theme>
   contentSx?: SxProps<Theme>
   backgroundSx?: SxProps<Theme>
   onCardClick?: (consultingId: string) => void
}

export const ConsultingCardBase = ({
   event,
   children,
   rootSx,
   contentSx,
   backgroundSx,
   onCardClick,
}: ConsultingCardBase) => {
   const imageUrl = event.backgroundImageUrl
   const router = useRouter()

   const dialogLink = buildDialogLink({
      router,
      link: {
         type: "livestreamDetails",
         livestreamId: event.id,
      },
      originSource: "consulting-section",
   })

   const handleClick = () => {
      if (onCardClick) {
         return onCardClick?.(event.id)
      }
      router.push(dialogLink, undefined, {
         shallow: true,
         scroll: false,
      })
   }

   const isLink = !onCardClick

   return (
      <Box
         key={event.id}
         sx={combineStyles(styles.consultingCard, rootSx, { position: "relative" })}
         onClick={handleClick}
         component={isLink ? Link : Box}
         href={isLink ? dialogLink : undefined}
         shallow
         scroll={false}
      >
         <Box
            className="consultingBackground"
            sx={combineStyles(styles.consultingBackground, backgroundSx, {
               backgroundImage: `url(${imageUrl})`,
            })}
         />
         <Box sx={contentSx}>{children}</Box>
      </Box>
   )
}

type ConsultingDateBadgeProps = {
   startDate: Date | null | undefined
   variant: "small" | "default"
}

export const ConsultingDateBadge = ({
   startDate,
   variant = "default",
}: ConsultingDateBadgeProps) => {
   if (!startDate) {
      return null
   }

   if (variant === "small") {
      return (
         <Chip
            sx={styles.dateBadgeSmall}
            label={
               <Typography variant="xsmall" p={0} fontWeight={400}>
                  {formatDateForBadge(startDate)}
               </Typography>
            }
         />
      )
   }

   return (
      <Box sx={styles.dateBadge}>
         <CalendarDate startDate={startDate} />
      </Box>
   )
}

const ConsultingHostAvatar = ({
   logoUrl,
   size = 28,
}: {
   logoUrl: string
   size?: number
}) => {
   return (
      <Avatar
         sx={[styles.avatar, { width: size, height: size }]}
         src={logoUrl}
      />
   )
}

export const ConsultingHostAvatars = ({
   logoUrls,
   size = 28,
}: {
   logoUrls: string[]
   size?: number
}) => {
   return (
      <Stack sx={styles.avatarsContainer} direction="row" spacing={0.5}>
         {logoUrls.map((logoUrl, index) => (
            <ConsultingHostAvatar key={index} logoUrl={logoUrl} size={size} />
         ))}
      </Stack>
   )
}

type ConsultingRegistrationStatusProps = {
   isRegistered: boolean
   variant?: "small" | "default"
}

export const ConsultingRegistrationStatus = ({
   isRegistered,
   variant = "default",
}: ConsultingRegistrationStatusProps) => {
   const theme = useTheme()
   const showRegisteredText = variant === "default" && isRegistered

   if (!isRegistered) {
      return null
   }

   return (
      <Chip
         sx={[
            styles.registrationBadge,
            showRegisteredText
               ? {
                    width: "fit-content",
                 }
               : null,
         ]}
         color="primary"
         icon={<CheckCircle size={16} color={theme.palette.primary.main} />}
         label={
            showRegisteredText ? (
               <Typography
                  variant="xsmall"
                  fontWeight={400}
                  color={"neutral.700"}
               >
                  Registered
               </Typography>
            ) : null
         }
      />
   )
}

const formatDateForBadge = (date: Date): string => {
   const day = date.getDate()
   const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase()
   return `${day} ${month.at(0).concat(month.toLowerCase().slice(1))}`
}