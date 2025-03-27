import { Group } from "@careerfairy/shared-lib/groups"
import { InteractionSourcesType } from "@careerfairy/shared-lib/groups/telemetry"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import {
   Box,
   Button,
   Card,
   CardActionArea,
   CardContent,
   CardMedia,
   Chip,
   Typography,
   useTheme,
} from "@mui/material"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import useCountGroupUpcomingLivestreams from "components/custom-hook/live-stream/useCountGroupUpcomingLivestreams"
import useIsUserFeaturedCompany from "components/custom-hook/user/useIsUserFeaturedCompany"
import Image from "next/legacy/image"
import { FC } from "react"
import { Briefcase, Star } from "react-feather"
import { useInView } from "react-intersection-observer"
import { CompanySearchResult } from "types/algolia"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { sxStyles } from "../../../types/commonTypes"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"
import Link from "../common/Link"
import FollowButton from "../common/company/FollowButton"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "../common/company/company-tags"
import PublicSparksBadge from "../common/icons/PublicSparksBadge"
import CircularLogo from "../common/logos/CircularLogo"
import { getCompanySizeLabel } from "../company-page/Header"

const LOGO_SIZE = 75

const styles = sxStyles({
   root: {
      borderRadius: 2,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      "& .illustration": {
         transition: (theme) => theme.transitions.create("transform"),
      },
      "&:hover, &:focus": {
         "& .illustration": {
            transform: "scale(1.1)",
         },
         background: "rgba(0, 0, 0, 0.0005)",
      },
      height: "100%",
      minHeight: "312px",
   },
   actionArea: {
      color: "text.primary",
      textDecoration: "none",
      position: "absolute",
      inset: 0,
      "& .MuiCardActionArea-focusHighlight": {
         background: "transparent",
      },
   },
   media: {
      height: 120,
      position: "relative",
      "&::before": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: "rgba(0, 0, 0, 0.20)",
         zIndex: 1,
      },
      "& a": {
         zIndex: 2,
         cursor: "pointer",
      },
   },
   content: {
      px: 2,
      flex: 1,
      display: "flex",
      position: "relative",
      pt: 5,
      pb: "16px !important",
   },
   companyName: {
      ...getMaxLineStyles(1),
   },
   italic: {
      fontStyle: "italic",
   },
   livestreamTitle: {
      ...getMaxLineStyles(2),
      height: 45,
      color: "text.primary",
   },
   companyLogoWrapper: {
      position: "absolute",
      top: -LOGO_SIZE / 2,
      zIndex: 2,
   },
   followButtonWrapper: {
      position: "absolute",
      top: "-15px",
      right: (theme) => theme.spacing(3),
   },
   followButton: {
      borderRadius: "18px",
      boxShadow: "none",
      textTransform: "none",
      zIndex: 1,
      textDecoration: "none !important",
      fontWeight: 400,
   },
   badge: {
      height: 24,
      width: 24,
      ml: 1,
   },
   companyTag: {
      color: (theme) => theme.palette.neutral[900],
      fontSize: "16px !important",
   },
   hiringChip: {
      color: (theme) => theme.palette.neutral[700],
   },
   featuredChip: {
      color: (theme) => theme.palette.warning[600],
      border: (theme) => `1px solid ${theme.palette.warning[600]}`,
   },
   tag: {
      padding: "4px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "4px",
      height: "unset",
      backgroundColor: (theme) => theme.brand.white[200],
      "& .MuiChip-label, p": {
         fontSize: "12px",
         fontWeight: 400,
         lineHeight: "16px",
         padding: 0,
      },
      "& .MuiChip-icon": {
         margin: 0,
         width: "14px",
         height: "14px",
      },
      zIndex: (theme) => theme.zIndex.appBar - 1,
   },
   upcomingLivestreamButton: {
      background: (theme) => theme.brand.info[50],
      p: "8px 2px",
      borderRadius: "8px",
      "&:hover": {
         background: (theme) => theme.brand.info[100],
      },
      zIndex: 3,
      width: "100%",
   },
})

type Props = {
   company: Group | CompanySearchResult
   interactionSource: InteractionSourcesType
}

const CompanyCard: FC<Props> = ({ company, interactionSource }) => {
   const [ref, inView] = useInView({
      triggerOnce: true, // Only fetch the next livestreams when the card is in view
   })

   const theme = useTheme()

   const isHiringNow = company?.hasJobs
   const isFeaturedCompany = useIsUserFeaturedCompany(company)

   const { count: upcomingLivestreamCount } = useCountGroupUpcomingLivestreams(
      company.id
   )

   const hasUpcomingLivestreams = upcomingLivestreamCount > 0

   return (
      <Card ref={ref} sx={[styles.root]}>
         <CardMedia sx={styles.media} title={company.universityName}>
            <Stack direction={"row"} ml={2} mt={2} spacing={1}>
               {isFeaturedCompany ? (
                  <Chip
                     key={"featured-company-chip"}
                     icon={
                        <Star
                           color={theme.palette.warning[600]}
                           width={14}
                           height={14}
                           fill={theme.palette.warning[600]}
                        />
                     }
                     sx={[styles.tag, styles.featuredChip]}
                     color={"info"}
                     label={<Typography>Featured company</Typography>}
                  />
               ) : null}
               {isHiringNow ? (
                  <Chip
                     key={"hiring-now-chip"}
                     icon={
                        <Briefcase color={"#3A70E2"} width={14} height={14} />
                     }
                     sx={[styles.tag, styles.hiringChip]}
                     color={"info"}
                     label={<Typography>Hiring now</Typography>}
                  />
               ) : null}
            </Stack>
            <Image
               src={getResizedUrl(company.bannerImageUrl, "md")}
               className="illustration"
               layout="fill"
               alt={company.universityName}
               objectFit="cover"
            />
            <LinkToCompanyPage
               companyName={company.universityName}
               interactionSource={interactionSource}
            />
         </CardMedia>
         <CardContent sx={styles.content}>
            <Box sx={styles.companyLogoWrapper}>
               <CircularLogo
                  src={company.logoUrl}
                  alt={company.universityName}
                  size={LOGO_SIZE}
               />
            </Box>
            <Box sx={styles.followButtonWrapper}>
               {inView ? ( // Only render the follow button when the card is in view, since it does a request to the server
                  <FollowButton
                     group={company}
                     size={"small"}
                     sx={styles.followButton}
                     startIcon={null}
                     interactionSource={interactionSource}
                  />
               ) : (
                  <Skeleton variant="rectangular" width={100} height={30} />
               )}
            </Box>
            <Stack flex={1} spacing={2} mt={2} minWidth={0} width="100%">
               <Stack flexDirection={"row"} alignItems={"center"}>
                  <Typography
                     sx={styles.companyName}
                     variant="h6"
                     fontWeight={600}
                     whiteSpace="pre-line"
                     component="h2"
                  >
                     {company.universityName}
                  </Typography>

                  {company.publicSparks ? (
                     <PublicSparksBadge sx={styles.badge} />
                  ) : null}
               </Stack>
               <Stack spacing={"6px"} sx={{ width: "100%", minWidth: 0 }}>
                  <CompanyCountryTag
                     fontSize="16px"
                     text={company.companyCountry?.name}
                     color={theme.palette.neutral[900]}
                  />
                  <CompanyIndustryTag
                     text={company.companyIndustries
                        ?.map(({ name }) => name)
                        .join(", ")}
                     fontSize="16px"
                     color={theme.palette.neutral[900]}
                     // It would make more sense to not be conditional, as cards with long industry names would force
                     // other cards to be taller even if no upcoming streams, with the ellipsis all card heights would be the same.
                     disableMultiline={hasUpcomingLivestreams}
                  />
                  <CompanySizeTag
                     text={getCompanySizeLabel(company.companySize)}
                     fontSize="16px"
                     color={theme.palette.neutral[900]}
                  />
               </Stack>
               {hasUpcomingLivestreams ? (
                  <Link
                     href={`/company/${companyNameSlugify(
                        company.universityName
                     )}/livestreams`}
                  >
                     <Button
                        sx={styles.upcomingLivestreamButton}
                        variant="contained"
                     >
                        <Typography
                           variant="medium"
                           color={theme.brand.info[600]}
                        >
                           {upcomingLivestreamCount} upcoming{" "}
                           {upcomingLivestreamCount === 1
                              ? "livestream"
                              : "livestreams"}
                        </Typography>
                     </Button>
                  </Link>
               ) : null}
            </Stack>
            <LinkToCompanyPage
               companyName={company.universityName}
               interactionSource={interactionSource}
            />
         </CardContent>
      </Card>
   )
}

export const CompanyCardSkeleton: FC = () => {
   return (
      <Card sx={[styles.root]}>
         <CardMedia sx={styles.media} title="Company Name">
            <Skeleton variant="rectangular" width="100%" height="100%" />
         </CardMedia>
         <CardContent sx={styles.content}>
            <Box sx={styles.companyLogoWrapper}>
               <Skeleton
                  variant="circular"
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
               />
            </Box>
            <Box sx={styles.followButtonWrapper}>
               <Skeleton variant="rectangular" width={100} height={30} />
            </Box>
            <Stack flex={1} justifyContent="space-between" spacing={2}>
               <Skeleton variant="text" width={200} />
               <Stack spacing={1}>
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width={100} />
               </Stack>
               <UpcomingLivestreamSkeleton />
            </Stack>
         </CardContent>
      </Card>
   )
}

const UpcomingLivestreamSkeleton = () => {
   return (
      <Stack spacing={1}>
         <LivestreamHeader>
            <Skeleton variant="text" width={200} />
         </LivestreamHeader>
         <LivestreamTitle>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
         </LivestreamTitle>
      </Stack>
   )
}

const LivestreamHeader: FC<{
   children: React.ReactNode
}> = ({ children }) => (
   <Typography
      color="primary.main"
      fontSize="0.931rem"
      fontWeight={600}
      component="h2"
   >
      {children}
   </Typography>
)

const LivestreamTitle: FC<{
   italic?: boolean
   children: React.ReactNode
}> = ({ children, italic }) => {
   return (
      <Typography
         sx={[styles.livestreamTitle, italic && styles.italic]}
         width="100%"
         component="h2"
         fontSize="1.07rem"
         fontWeight={500}
         whiteSpace="pre-line"
      >
         {children}
      </Typography>
   )
}

const LinkToCompanyPage: FC<{
   companyName: string
   children?: React.ReactNode
   interactionSource: InteractionSourcesType
}> = ({ companyName, children, interactionSource }) => {
   return (
      <CardActionArea
         href={makeGroupCompanyPageUrl(companyName, {
            interactionSource,
         })}
         sx={styles.actionArea}
         component={Link}
         disableRipple
      >
         {children}
      </CardActionArea>
   )
}

// /**
//  * Generates JSON-LD structured data for a company to improve SEO.
//  * The structured data is formatted according to the schema.org vocabulary.
//  * More info can be found here: https://schema.org/Organization
//  *
//  * @param {Object} company - The company object containing company information.
//  * @returns {Object} - An object with a __html property containing the JSON-LD structured data as a string.
//  */
// const generateCompanyJsonLd = (company: Group) => {
//    const companyJsonLd = {
//       "@context": "https://schema.org/",
//       "@type": "Organization",
//       name: company.universityName,
//       legalName: company.universityName,
//       logo: company.logoUrl,
//       image: [company.logoUrl, company.bannerImageUrl],
//       url: `${getBaseUrl()}/company/${companyNameSlugify(
//          company.universityName
//       )}`,
//       description: `${company.description} - ${company.extraInfo}`,
//       address: {
//          "@type": "PostalAddress",
//          addressCountry: company.companyCountry.name,
//       },
//       numberOfEmployees: company.companySize,
//       slogan: company.description,
//       identifier: {
//          "@type": "PropertyValue",
//          name: "Company ID",
//          value: company.id,
//       },
//    }
//
//    return {
//       __html: JSON.stringify(companyJsonLd),
//    }
// }

export default CompanyCard
