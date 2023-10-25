import { FC } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import {
   Box,
   Card,
   CardActionArea,
   CardContent,
   CardMedia,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import Image from "next/image"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "../common/company/company-tags"
import { useInView } from "react-intersection-observer"
import Skeleton from "@mui/material/Skeleton"
import { SuspenseWithBoundary } from "../../ErrorBoundary"
import FollowButton from "../common/company/FollowButton"
import Link from "../common/Link"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import useCompanyUpcomingLivestream from "./useCompanyUpcomingLivestream"
import PublicSparksBadge from "../common/icons/PublicSparksBadge"
import CircularLogo from "../common/CircularLogo"

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
      },
   },
   actionArea: {
      color: "text.primary",
      textDecoration: "none",
      position: "absolute",
      inset: 0,
   },
   media: {
      height: 120,
      position: "relative",
   },
   content: {
      px: 3,
      flex: 1,
      display: "flex",
      position: "relative",
      pt: 5,
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
      background: (theme) => theme.palette.background.paper,
      borderRadius: 1.2,
   },
   followButton: {
      borderRadius: 1,
      py: 0.5,
      px: 2.25,
      boxShadow: "none",
      textTransform: "none",
      zIndex: 1,
      textDecoration: "none !important",
      fontWeight: "bold",
   },
   badge: {
      height: 32,
      width: 32,
      ml: 1,
   },
})

type Props = {
   company: Group
}

const CompanyCard: FC<Props> = ({ company }) => {
   const [ref, inView] = useInView({
      triggerOnce: true, // Only fetch the next livestreams when the card is in view
   })

   return (
      <Card ref={ref} sx={[styles.root]}>
         <CardMedia sx={styles.media} title={company.universityName}>
            <Image
               src={getResizedUrl(company.bannerImageUrl, "md")}
               className="illustration"
               layout="fill"
               alt={company.universityName}
               objectFit="cover"
            />
            <LinkToCompanyPage companyName={company.universityName} />
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
                  />
               ) : (
                  <Skeleton variant="rectangular" width={100} height={30} />
               )}
            </Box>
            <Stack flex={1} justifyContent="space-between" spacing={2}>
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
               <Stack spacing={1}>
                  <CompanyCountryTag
                     fontSize="1.07rem"
                     text={company.companyCountry.name}
                  />
                  <CompanyIndustryTag
                     fontSize="1.07rem"
                     text={company.companyIndustries
                        ?.map(({ name }) => name)
                        .join(", ")}
                  />
                  <CompanySizeTag
                     fontSize="1.07rem"
                     text={company.companySize}
                  />
               </Stack>
               {inView ? ( // Only fetch the next livestreams when the card is in view
                  <SuspenseWithBoundary
                     fallback={<UpcomingLivestreamSkeleton />}
                  >
                     <UpcomingLivestream
                        groupName={company.universityName}
                        groupId={company.id}
                     />
                  </SuspenseWithBoundary>
               ) : (
                  <UpcomingLivestreamSkeleton />
               )}
            </Stack>
            <LinkToCompanyPage companyName={company.universityName} />
         </CardContent>
         {/*<script*/}
         {/*   type="application/ld+json"*/}
         {/*   dangerouslySetInnerHTML={generateCompanyJsonLd(company)}*/}
         {/*   key="company-jsonld"*/}
         {/*/>*/}
      </Card>
   )
}

type UpcomingLivestreamProps = {
   groupId: string
   groupName: string
}
const UpcomingLivestream: FC<UpcomingLivestreamProps> = ({
   groupId,
   groupName,
}) => {
   const { data: livestreams } = useCompanyUpcomingLivestream(groupId)
   const livestream = livestreams?.[0]

   return (
      <Stack spacing={1}>
         <LivestreamHeader>
            {livestream ? "Upcoming Live Stream" : "No Upcoming Live Stream"}
         </LivestreamHeader>

         <LivestreamTitle italic={!livestream}>
            {livestream
               ? livestream.title
               : `Follow ${groupName} to be notified about new live streams.`}
         </LivestreamTitle>
      </Stack>
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

const LivestreamHeader: FC = ({ children }) => (
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

const LinkToCompanyPage: FC<{ companyName: string }> = ({
   companyName,
   children,
}) => {
   return (
      <CardActionArea
         href={`/company/${companyNameSlugify(companyName)}`}
         sx={styles.actionArea}
         component={Link}
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
