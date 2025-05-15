import { Typography } from "@mui/material"

import { Skeleton } from "@mui/material"

import { Box } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { sxStyles } from "types/commonTypes"
import CircularLogo from "../logos/CircularLogo"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"

const cardAvatarSize = 65
const cardAvatarSizePastEvent = 28

const styles = sxStyles({
   headerWrapper: {
      display: "flex",
      width: "100%",
      gap: "8px",
      marginTop: "-12px",
   },
   pastEventHeaderWrapper: {
      marginTop: 1,
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      flex: "1 0 0",
      flexDirection: "column",
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 600,
      overflow: "hidden",
   },
   companyNameWrapperPastEvent: {
      color: (theme) => theme.palette.neutral[900],
      fontWeight: 400,
   },
   companyName: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      width: "100%",
   },
   title: {
      height: "48px",
      fontWeight: 600,
      ...getMaxLineStyles(2),
   },
   summary: {
      fontWeight: 400,
      lineHeight: "20px",
      ...getMaxLineStyles(2),
   },
})

export const CompanyName = () => {
   const { livestream, loading, animation, isPast } =
      useEventPreviewCardContext()
   return (
      <Box sx={[styles.headerWrapper, isPast && styles.pastEventHeaderWrapper]}>
         {loading ? (
            <>
               <Skeleton
                  animation={animation ?? "wave"}
                  variant="circular"
                  width={cardAvatarSize}
                  height={cardAvatarSize}
               />
               <Skeleton
                  animation={animation}
                  variant="rectangular"
                  sx={{ mt: 3, borderRadius: 3 }}
                  width={200}
                  height={16}
               />
            </>
         ) : (
            <>
               <CircularLogo
                  src={livestream?.companyLogoUrl}
                  alt={`logo of company ${livestream?.company}`}
                  size={isPast ? cardAvatarSizePastEvent : cardAvatarSize}
               />
               <Box
                  sx={[
                     styles.companyNameWrapper,
                     isPast && styles.companyNameWrapperPastEvent,
                  ]}
               >
                  <Typography variant="small" sx={styles.companyName}>
                     {livestream?.company}
                  </Typography>
               </Box>
            </>
         )}
      </Box>
   )
}

export const Title = () => {
   const { livestream, loading, animation } = useEventPreviewCardContext()
   return (
      <Typography
         variant={"brandedBody"}
         color="text.primary"
         sx={styles.title}
         data-testid={`livestream-card-title-${livestream?.id}`}
      >
         {loading ? (
            <Skeleton
               animation={animation}
               variant="rectangular"
               sx={{ mt: 5, borderRadius: 3 }}
               width={300}
               height={16}
            />
         ) : (
            livestream?.title
         )}
      </Typography>
   )
}

export const Summary = () => {
   const { livestream, loading, animation } = useEventPreviewCardContext()
   return (
      <Typography
         variant={"small"}
         color="text.secondary"
         sx={styles.summary}
         className="summary"
      >
         {loading ? (
            <Skeleton
               animation={animation}
               variant="rectangular"
               sx={{ borderRadius: 3 }}
               width={300}
               height={16}
            />
         ) : (
            livestream?.summary
         )}
      </Typography>
   )
}
