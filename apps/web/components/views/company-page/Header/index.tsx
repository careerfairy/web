import { CompanySizesCodes } from "@careerfairy/shared-lib/constants/forms"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "components/views/common/company/company-tags"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useMountedState } from "react-use"
import { useCompanyPage } from "../"
import { companyLogoPlaceholder } from "../../../../constants/images"
import { sxStyles } from "../../../../types/commonTypes"
import useElementIsAtTopOfPage from "../../../custom-hook/useElementIsAtTopOfPage"
import useIsMobile from "../../../custom-hook/useIsMobile"
import FollowButton from "../../common/company/FollowButton"
import BannerIllustration from "./BannerIllustration"
import ShareButton from "./ShareButton"

const LOGO_SIZE = 84
const DESKTOP_LOGO_SIZE = LOGO_SIZE * 1.5
const NAV_BG_COLOR = "#FEFEFE"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "250px", md: "300px" },
      position: "relative",
   },
   logo: {
      width: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      height: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      marginRight: "-5px",
   },
   navigatorWrapper: {
      marginTop: { xs: "-45px", md: "-65px" },
      display: "flex",
      width: "-webkit-fill-available",
      flexDirection: { xs: "column", md: "row" },
   },
   navigatorInfoWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
   navigatorTabs: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flex: 1,
      height: { xs: "50px", md: "60px" },
      backgroundColor: NAV_BG_COLOR,
   },
})

const Header = () => {
   const isMobile = useIsMobile()
   const isMounted = useMountedState()

   const [ref] = useElementIsAtTopOfPage({
      offset: isMobile ? -60 : 70,
   })

   const { group } = useCompanyPage()

   const { logoUrl, universityName } = group

   if (!isMounted()) return null

   return (
      <>
         <BannerIllustration />
         <span ref={ref} />
         <Box height={0} />
         <Box>
            <Box display={"flex"}>
               <Box bgcolor={NAV_BG_COLOR} flex={1} />
               <Box sx={styles.navigatorWrapper}>
                  <Stack
                     alignItems={"flex-end"}
                     justifyContent={"space-between"}
                     direction={"row"}
                     spacing={2}
                     bgcolor={isMobile ? "white" : NAV_BG_COLOR}
                     pl={2}
                  >
                     <Box sx={{ pb: { xs: 2, md: 0 } }}>
                        <CircularLogo
                           sx={styles.logo}
                           alt={`${universityName} logo`}
                           src={logoUrl || companyLogoPlaceholder}
                           size={DESKTOP_LOGO_SIZE}
                        />
                     </Box>
                     {isMobile ? (
                        <span>
                           <ActionButtons />
                        </span>
                     ) : null}
                  </Stack>
                  <Box sx={styles.navigatorInfoWrapper}>
                     <Box sx={styles.navigatorTabs}>
                        {isMobile ? null : <ActionButtons />}
                     </Box>
                  </Box>
               </Box>
               <Box flex={1} bgcolor={NAV_BG_COLOR} />
            </Box>
            <Box
               sx={{
                  backgroundColor: NAV_BG_COLOR,
                  borderRadius: "0 0 12px 12px",
                  pl: 2,
                  pb: 2,
                  pt: 1,
               }}
            >
               <Stack spacing={1}>
                  <Typography
                     color={"neutral.900"}
                     variant="brandedH4"
                     fontWeight={600}
                  >
                     {group.universityName}
                  </Typography>
                  <Stack spacing={2} direction={isMobile ? "column" : "row"}>
                     <CompanyCountryTag
                        text={group.companyCountry?.name}
                        fontSize="14px"
                     />
                     <CompanyIndustryTag
                        text={group.companyIndustries
                           ?.map((industry) => industry.name)
                           ?.join(", ")}
                        fontSize="14px"
                     />
                     <CompanySizeTag
                        text={getCompanySizeLabel(group.companySize)}
                        fontSize="14px"
                     />
                  </Stack>
               </Stack>
            </Box>
         </Box>
      </>
   )
}

export const getCompanySizeLabel = (companySize: string) => {
   if (!companySize) return ""

   return CompanySizesCodes.find(
      (size) => size.id === companySize
   )?.label?.replace(" employees", "")
}

const ActionButtons = () => {
   const { group, editMode, groupPresenter } = useCompanyPage()
   const isMobile = useIsMobile()
   const showFollowButton = Boolean(!editMode)

   const showShareButton = groupPresenter.companyPageIsReady()

   return (
      <Stack spacing={1} pr={2} direction={"row"} mt={isMobile ? 1 : 9}>
         {showFollowButton ? (
            <FollowButton
               sx={{
                  fontSize: undefined,
               }}
               color="primary"
               size="medium"
               group={group}
               interactionSource={InteractionSources.Company_Page}
            />
         ) : null}
         {showShareButton ? <ShareButton /> : null}
      </Stack>
   )
}

export default Header
