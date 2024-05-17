import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import {
   Box,
   Card,
   CardContent,
   CardMedia,
   Stack,
   Typography,
} from "@mui/material"
import SanitizedHTML from "components/util/SanitizedHTML"
import Link from "components/views/common/Link"
import FollowButton from "components/views/common/company/FollowButton"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "components/views/common/company/company-tags"
import PublicSparksBadge from "components/views/common/icons/PublicSparksBadge"
import CircularLogo from "components/views/common/logos/CircularLogo"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"
import Image from "next/legacy/image"
import { useMemo } from "react"
import { ChevronRight as MoreIcon } from "react-feather"
import StaticSkeleton from "./StaticSkeleton"

const LOGO_SIZE = 120

const styles = sxStyles({
   root: {
      display: "flex",
      boxShadow: "none",
      border: "1px solid #E1E1E1",
      flexDirection: {
         xs: "column",
         sm: "row",
      },
   },
   media: {
      width: {
         xs: "100%",
         sm: 205,
      },
      height: {
         xs: 205,
         sm: "auto",
      },
      position: "relative",
   },
   overlay: {
      position: "absolute",
      inset: 0,
      background:
         "linear-gradient(0deg, rgba(245, 245, 245, 0.9), rgba(245, 245, 245, 0.9))",
   },
   content: (theme) => ({
      px: `${theme.spacing(3)} !important`,
      py: `${theme.spacing(5)} !important`,
      flex: 1,
   }),
   logoWrapper: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "fit-content",
      height: "fit-content",
   },
   followButton: {
      borderRadius: 1,
      py: 0.5,
      px: 2.25,
      textTransform: "none",
      zIndex: 1,
      textDecoration: "none !important",
      boxShadow: "none !important",
   },
   button: {
      borderRadius: 1,
   },
   companyName: {
      fontSize: "1.285rem",
      fontWeight: 600,
   },
   companyDescription: {
      fontSize: "1.071rem",
      fontWeight: 400,
      mt: 1.875,
   },
   companyCta: {
      fontSize: "1.142rem",
      fontWeight: "in",
      color: "inherit",
      "&:hover": {
         mr: 1,
         transition: (theme) => theme.transitions.create("margin-right"),
      },
   },
   badge: {
      height: 32,
      width: 32,
      ml: 1,
   },
})

type FollowCompanyButtonProps = {
   company: Group
}

const FollowCompanyButton = ({ company }: FollowCompanyButtonProps) => {
   return (
      <span>
         <FollowButton
            variant={"outlined"}
            size={"small"}
            startIcon={null}
            sx={styles.followButton}
            group={company}
         />
      </span>
   )
}

type AboutCompanyComponentProps = {
   company: Group
   backgroundImageUrl: LivestreamEvent["backgroundImageUrl"]
   companyLogoUrl: LivestreamEvent["companyLogoUrl"]
   companyName: LivestreamEvent["company"]
}

const AboutCompanyComponent = ({
   company,
   backgroundImageUrl,
   companyLogoUrl,
   companyName,
}: AboutCompanyComponentProps) => {
   const companyPresenter = useMemo(
      () => (company ? GroupPresenter.createFromDocument(company) : null),
      [company]
   )

   const showCompanyPageCta = Boolean(companyPresenter?.publicProfile)

   if (!companyPresenter || !companyPresenter.hasMinimumData()) {
      return <AboutCompanySkeleton />
   }

   return (
      <>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <Card sx={styles.root}>
            <CardMedia sx={styles.media}>
               <Image
                  src={backgroundImageUrl}
                  width={205}
                  height={205}
                  layout="fill"
                  alt="Thumbnail"
                  objectFit="cover"
               />
               <Box sx={styles.overlay} />
               <Box sx={styles.logoWrapper}>
                  <CircularLogo
                     src={companyLogoUrl}
                     alt={companyName}
                     size={LOGO_SIZE}
                  />
               </Box>
            </CardMedia>
            <CardContent sx={styles.content}>
               <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
               >
                  <Stack flexDirection={"row"} alignItems={"center"}>
                     <Typography component="h5" sx={styles.companyName}>
                        {companyName}
                     </Typography>

                     {company.publicSparks ? (
                        <PublicSparksBadge sx={styles.badge} />
                     ) : null}
                  </Stack>

                  <FollowCompanyButton company={company} />
               </Stack>
               <Stack
                  mt={2.25}
                  direction={{
                     xs: "column",
                     sm: "row",
                  }}
                  spacing={2}
               >
                  {company.companyCountry ? (
                     <CompanyCountryTag
                        fontSize={"1.07rem"}
                        text={company.companyCountry.name}
                     />
                  ) : null}
                  {company.companyIndustries?.length ? (
                     <CompanyIndustryTag
                        fontSize={"1.07rem"}
                        text={company.companyIndustries
                           .map(({ name }) => name)
                           .join(", ")}
                     />
                  ) : null}
                  {company.companySize ? (
                     <CompanySizeTag
                        fontSize={"1.07rem"}
                        text={company.companySize}
                     />
                  ) : null}
               </Stack>
               <SanitizedHTML
                  htmlString={company.extraInfo}
                  sx={styles.companyDescription}
               />
               {showCompanyPageCta ? (
                  <Box
                     display="flex"
                     component={Link}
                     noLinkStyle
                     href={"#"}
                     alignItems={"center"}
                     color={"primary.main"}
                     fontWeight={500}
                     mt={2.687}
                  >
                     <Typography mr={0.5} sx={styles.companyCta}>
                        Discover {company.universityName}
                     </Typography>
                     <MoreIcon size={22} fontWeight={"inherit"} />
                  </Box>
               ) : null}
            </CardContent>
         </Card>
      </>
   )
}

export const AboutCompanySkeleton = () => {
   return (
      <>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <Card sx={styles.root}>
            <CardMedia sx={styles.media}>
               <Box sx={styles.overlay} />
               <Box sx={styles.logoWrapper}>
                  <StaticSkeleton
                     variant="circular"
                     width={LOGO_SIZE}
                     height={LOGO_SIZE}
                  />
               </Box>
            </CardMedia>
            <CardContent sx={styles.content}>
               <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
               >
                  <Typography
                     width="70%"
                     component="h5"
                     sx={styles.companyName}
                  >
                     <StaticSkeleton />
                  </Typography>
                  <StaticSkeleton
                     sx={styles.button}
                     variant="rectangular"
                     width={100}
                     height={30}
                  />
               </Stack>
               <Stack
                  mt={2.25}
                  direction={{
                     xs: "column",
                     sm: "row",
                  }}
                  spacing={2}
               >
                  <CompanyCountryTag
                     fontSize={"1.07rem"}
                     text={<StaticSkeleton width={60} />}
                  />
                  <CompanyIndustryTag
                     fontSize={"1.07rem"}
                     text={<StaticSkeleton width={60} />}
                  />
                  <CompanySizeTag
                     fontSize={"1.07rem"}
                     text={<StaticSkeleton width={60} />}
                  />
               </Stack>
               <Typography width="100%" sx={styles.companyDescription}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <StaticSkeleton key={i} />
                  ))}
                  <StaticSkeleton width="50%" />
               </Typography>
               <Typography mt={2.687} sx={styles.companyCta}>
                  <StaticSkeleton width={200} />
               </Typography>
            </CardContent>
         </Card>
      </>
   )
}

export default AboutCompanyComponent
