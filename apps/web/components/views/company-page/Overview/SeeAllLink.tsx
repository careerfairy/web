import { Stack, Typography, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { ArrowRight } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      cursor: "pointer",
   },
   seeAllLink: {
      textDecoration: "underline",
      fontWeight: 400,
   },
   mobileSeeAllLink: {
      fontWeight: 400,
   },
})
type Props = {
   href: string
   onClick?: () => void
}

export const SeeAllLink = ({ href, onClick }: Props) => {
   const isMobile = useIsMobile()
   const theme = useTheme()

   const SeelAll = (
      <Stack
         direction="row"
         alignItems="center"
         spacing={"6px"}
         sx={styles.root}
      >
         <Typography
            variant="small"
            color="neutral.600"
            sx={isMobile ? styles.mobileSeeAllLink : styles.seeAllLink}
            onClick={onClick}
         >
            See all
         </Typography>
         {isMobile ? (
            <ArrowRight size={14} color={theme.brand.black[700]} />
         ) : null}
      </Stack>
   )

   return onClick ? SeelAll : <Link href={href}>{SeelAll}</Link>
}
