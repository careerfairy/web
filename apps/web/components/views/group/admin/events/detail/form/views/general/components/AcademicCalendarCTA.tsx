import { Box, Link, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Info } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      textDecorationColor: "transparent",
      color: "neutral.700",
      transition: (theme) =>
         theme.transitions.create(["text-decoration-color"], {
            duration: theme.transitions.duration.short,
         }),
      "&:hover, &:focus": {
         textDecorationColor: "currentColor",
      },
   },
   text: {
      lineHeight: "20px",
   },
   icon: {
      color: (theme) => theme.brand.info[600],
      flexShrink: 0,
   },
   cta: {
      fontWeight: 500,
      textWrap: "nowrap",
   },
})

export const AcademicCalendarCTA = () => {
   const isMobile = useIsMobile()

   return (
      <Stack
         component={Link}
         href="https://careerfairy.io/employers/academic-calendar"
         target="_blank"
         rel="noopener noreferrer"
         direction="row"
         spacing={0.5}
         mt={isMobile ? 0 : 1}
         sx={styles.root}
      >
         <Box component={Info} size={isMobile ? 18 : 20} sx={styles.icon} />
         <Typography sx={styles.text} variant="small">
            Plan smarter with our Academic Calendar.{" "}
            <Box component="span" sx={styles.cta}>
               Click here to view.
            </Box>
         </Typography>
      </Stack>
   )
}
