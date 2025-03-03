import { Group } from "@careerfairy/shared-lib/groups"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import SanitizedHTML from "components/util/SanitizedHTML"
import Image from "next/legacy/image"
import { useSnackbar } from "notistack"
import { FC, useMemo } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { sxStyles } from "../../../types/commonTypes"
import { dataLayerEvent } from "../../../util/analyticsUtils"
import { makeGroupCompanyPageUrl } from "../../../util/makeUrls"
import useSocials, { SocialPlatformObject } from "../../custom-hook/useSocials"
import {
   copyStringToClipboard,
   getMaxLineStyles,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"
import ReferralWidget from "./ReferralWidget"

const styles = sxStyles({
   title: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   body2: {
      fontSize: "1rem",
      mb: 3,
   },
   imageBox: {
      p: 0,
      "& img": {
         height: 50,
      },
   },
   titleBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   companyDescription: {
      ...getMaxLineStyles(3),
   },
})

type Props = {
   group: Group
   handleClose: () => void
   isGroupAdmin?: boolean
}

const ShareCompanyPageDialog: FC<Props> = ({
   group,
   handleClose,
   isGroupAdmin,
}) => {
   const { enqueueSnackbar } = useSnackbar()

   const socials = useSocials({
      title: group.universityName,
      url: makeGroupCompanyPageUrl(group.universityName),
      dataLayerEntityName: AnalyticsEvents.Company_Page,
      message: `Check out ${group.universityName}'s company page on CareerFairy!`,
      platforms: [
         SocialPlatformObject.Linkedin,
         SocialPlatformObject.Facebook,
         SocialPlatformObject.X,
         SocialPlatformObject.Email,
      ],
   })

   const companyPageLink = useMemo(() => {
      return makeGroupCompanyPageUrl(group.universityName)
   }, [group])

   const copyCompanyPageLinkToClipboard = (link: string) => {
      copyStringToClipboard(link)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      })
      dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
         medium: "Copy Link",
      })
   }

   if (!companyPageLink) return null

   return (
      <Dialog
         maxWidth="md"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={handleClose}
      >
         <DialogTitle>
            <Typography sx={styles.title}>
               {isGroupAdmin
                  ? `Share ${group.universityName} Company Page`
                  : `Share ${group.universityName}'s Company Page`}
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <Stack spacing={2}>
               <Typography sx={styles.body2} variant="body2" my={1}>
                  {isGroupAdmin
                     ? `Share your company page on your social media channels and with your network of young talent.`
                     : `Share this company page with your friends and network!`}
               </Typography>
               <Box>
                  <Stack spacing={4} direction="row">
                     <Box sx={styles.imageBox}>
                        <Image
                           src={getResizedUrl(group.logoUrl)}
                           alt={group.universityName}
                           width={100}
                           height={100}
                           objectFit={"contain"}
                        />
                     </Box>
                     <Box sx={styles.titleBox}>
                        <Typography fontWeight={800}>
                           {group.universityName}
                        </Typography>
                        <SanitizedHTML
                           htmlString={group.extraInfo}
                           sx={styles.companyDescription}
                           color={"text.secondary"}
                        />
                     </Box>
                  </Stack>
               </Box>
               <ReferralWidget socials={socials} noBackgroundColor />
               <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  <TextField
                     sx={{ flex: 1, marginRight: "10px" }}
                     variant="outlined"
                     value={companyPageLink}
                     disabled
                  />
                  <Button
                     variant="contained"
                     sx={{ boxShadow: "none" }}
                     startIcon={<ContentPasteIcon />}
                     onClick={() =>
                        copyCompanyPageLinkToClipboard(companyPageLink)
                     }
                  >
                     Copy
                  </Button>
               </Box>
            </Stack>
         </DialogContent>
         <DialogActions sx={{ justifyContent: "right" }}>
            <Button variant="outlined" onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ShareCompanyPageDialog
