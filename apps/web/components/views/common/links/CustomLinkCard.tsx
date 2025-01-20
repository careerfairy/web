import { ProfileLink } from "@careerfairy/shared-lib/users"
import { Box, Button, Stack, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Link from "next/link"
import { ExternalLink } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   linkTitle: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   linkUrl: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[600],
   },
   buttonLink: {
      p: 0,
      m: 0,
      color: "transparent",
      "&:hover": {
         backgroundColor: "unset",
      },
   },
   circularLogo: {
      mr: 1.5,
   },
})

type Props = {
   normalizedLink: string
   faviconSrc: string
   link: ProfileLink
   linkUrlValue: string
}
export const CustomLinkCard = ({
   normalizedLink,
   faviconSrc,
   link,
   linkUrlValue,
}: Props) => {
   return (
      <Button // MUI Button
         href={normalizedLink}
         target="_blank"
         LinkComponent={Link} // NextJS Link
         sx={styles.buttonLink}
      >
         <CircularLogo
            src={faviconSrc}
            alt={`${link.title} icon`}
            sx={styles.circularLogo}
            size={48}
         />
         <Stack>
            <Typography variant="brandedBody" sx={styles.linkTitle}>
               {link.title}
            </Typography>
            <Stack spacing={0.5} direction={"row"} alignItems={"center"}>
               <Typography variant="xsmall" sx={styles.linkUrl}>
                  {linkUrlValue}
               </Typography>
               <Link href={normalizedLink} target="_blank">
                  <Box
                     component={ExternalLink}
                     width={"12px"}
                     height={"12px"}
                     color="neutral.600"
                  />
               </Link>
            </Stack>
         </Stack>
      </Button>
   )
}
