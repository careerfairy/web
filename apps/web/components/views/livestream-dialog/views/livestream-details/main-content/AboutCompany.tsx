import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { CardContent, CardMedia, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import SanitizedHTML from "components/util/SanitizedHTML"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import { FC, useMemo } from "react"
import { ChevronRight as MoreIcon } from "react-feather"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupsByIds from "../../../../../custom-hook/useGroupsByIds"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import {
   CompanyCountryTag,
   CompanyIndustryTag,
   CompanySizeTag,
} from "../../../../common/company/company-tags"
import FollowButton from "../../../../common/company/FollowButton"
import PublicSparksBadge from "../../../../common/icons/PublicSparksBadge"
import Link from "../../../../common/Link"
import { InViewRef } from "../MainContentNavigation"
import Section from "./Section"
import SectionTitle from "./SectionTitle"

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
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   companyDescription: {
      fontSize: "1.14rem",
      fontWeight: 400,
      mt: 1.875,
      color: (theme) => theme.palette.neutral[800],
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
   backgroundImage: {
      objectFit: "cover",
   },
})

const LOGO_SIZE = 120

interface Props {
   presenter: LivestreamPresenter
   sectionRef?: InViewRef
}

const AboutCompany: FC<Props> = (props) => {
   return (
      <SuspenseWithBoundary fallback={<AboutCompanySkeleton />}>
         <AboutCompanyComponent {...props} />
      </SuspenseWithBoundary>
   )
}

const AboutCompanyComponent: FC<Props> = ({ presenter, sectionRef }) => {
   const company = useLivestreamCompany(presenter)

   const companyPresenter = useMemo(
      () => (company ? GroupPresenter.createFromDocument(company) : null),
      [company]
   )

   const isCompanyPagePublic = Boolean(companyPresenter?.publicProfile)

   const companyName = (
      <Typography variant="brandedH4" sx={styles.companyName}>
         {presenter.company}
      </Typography>
   )

   if (!companyPresenter || !companyPresenter.hasMinimumData()) {
      return null
   }

   return (
      <Section ref={sectionRef}>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <Card sx={styles.root}>
            <CardMedia sx={styles.media}>
               <Image
                  src={getResizedUrl(presenter.backgroundImageUrl, "lg")}
                  fill
                  alt="Thumbnail"
                  style={styles.backgroundImage}
                  priority
                  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <Box sx={styles.overlay} />
               <Box sx={styles.logoWrapper}>
                  <CircularLogo
                     src={presenter.companyLogoUrl}
                     alt={presenter.company}
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
                     {isCompanyPagePublic ? (
                        <Box
                           component={Link}
                           noLinkStyle
                           href={makeGroupCompanyPageUrl(
                              company.universityName,
                              {
                                 interactionSource:
                                    InteractionSources.Live_Stream_Details,
                              }
                           )}
                           sx={{ color: "white" }}
                        >
                           {companyName}
                        </Box>
                     ) : (
                        companyName
                     )}

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
                     <CompanyCountryTag text={company.companyCountry?.name} />
                  ) : null}
                  {company.companyIndustries?.length ? (
                     <CompanyIndustryTag
                        text={company.companyIndustries
                           .map(({ name }) => name)
                           .join(", ")}
                     />
                  ) : null}
                  {company.companySize ? (
                     <CompanySizeTag text={company.companySize} />
                  ) : null}
               </Stack>
               <SanitizedHTML
                  htmlString={company.extraInfo}
                  sx={styles.companyDescription}
               />
               {isCompanyPagePublic ? (
                  <Box
                     display="flex"
                     component={Link}
                     href={makeGroupCompanyPageUrl(company.universityName, {
                        interactionSource:
                           InteractionSources.Live_Stream_Details,
                     })}
                     alignItems={"center"}
                     noLinkStyle
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
      </Section>
   )
}

/*
 * Used to get the company host of the livestream
 *
 * @param {LivestreamPresenter} presenter
 * @returns {Group | null} company host of the livestream or null if there is no company host
 * */
const useLivestreamCompany = (presenter: LivestreamPresenter): Group | null => {
   const { data: hosts } = useGroupsByIds(presenter.groupIds ?? [])

   return useMemo<Group>(() => {
      const companyGroups = hosts.filter((group) => !group.universityCode)

      const isSingleCompany = companyGroups?.length === 1

      if (isSingleCompany) {
         return companyGroups[0]
      }

      return null
   }, [hosts])
}

const FollowCompanyButton: FC<{
   company: Group
}> = ({ company }) => {
   return (
      <span>
         <FollowButton
            variant={"outlined"}
            size={"small"}
            startIcon={null}
            sx={styles.followButton}
            group={company}
            interactionSource={InteractionSources.Live_Stream_Details}
         />
      </span>
   )
}

export const AboutCompanySkeleton: FC = () => {
   return (
      <Box>
         <SectionTitle>Connect with Our Brand</SectionTitle>
         <Card sx={styles.root}>
            <CardMedia sx={styles.media}>
               <Box sx={styles.overlay} />
               <Box sx={styles.logoWrapper}>
                  <Skeleton
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
                     <Skeleton />
                  </Typography>
                  <Skeleton
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
                     text={<Skeleton width={60} />}
                  />
                  <CompanyIndustryTag
                     fontSize={"1.07rem"}
                     text={<Skeleton width={60} />}
                  />
                  <CompanySizeTag
                     fontSize={"1.07rem"}
                     text={<Skeleton width={60} />}
                  />
               </Stack>
               <Typography width="100%" sx={styles.companyDescription}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} />
                  ))}
                  <Skeleton width="50%" />
               </Typography>
               <Typography mt={2.687} sx={styles.companyCta}>
                  <Skeleton width={200} />
               </Typography>
            </CardContent>
         </Card>
      </Box>
   )
}

export default AboutCompany
