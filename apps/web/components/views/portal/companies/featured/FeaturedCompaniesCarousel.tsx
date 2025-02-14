import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { sxStyles } from "@careerfairy/shared-ui"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useGroup from "components/custom-hook/group/useGroup"
import { useUserFollowingCompanies } from "components/custom-hook/user/useUserFollowingCompanies"
import FeaturedCompanySparksBadge from "components/views/common/icons/FeaturedCompanySparksBadge"
import { groupRepo } from "data/RepositoryInstances"
import Link from "next/link"
import { useCallback } from "react"
import { dataLayerEvent } from "util/analyticsUtils"

const styles = sxStyles({
   companyCardRoot: {
      width: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
      minWidth: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
      maxWidth: {
         xs: "317px !important",
         sm: "317px !important",
         md: "340px !important",
      },
   },
   carouselRoot: {
      overflow: "hidden",
      px: 2,
   },
   companyLogo: {
      width: "64px",
      height: "64px",
   },
   companyName: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 600,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      maxWidth: "75%",
   },
   companyIndustries: {
      color: (theme) => theme.brand.white[400],
      fontWeight: 400,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   companyCountry: {
      color: (theme) => theme.brand.white[400],
      fontWeight: 400,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
   },
   followButton: {
      width: "78px",
      p: "4px 12px",
      borderRadius: "18px",
      background: "rgba(252, 252, 254, 0.43)",
      backdropFilter: "blur(100px)",
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      border: "1px solid transparent",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
         borderRadius: "18px",
         border: "1px solid #FFF",
         background: "rgba(252, 252, 254, 0.43)",
         boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
         backdropFilter: "blur(100px)",
      },
   },
   followingButton: {
      width: "92px",
      background: "rgba(37, 37, 37, 0.43)",
      border: "none",
      "&:hover": {
         background: "rgba(37, 37, 37, 0.43)",
         border: "none",
      },
   },
   badge: {
      width: 24,
      height: 24,
   },
})

type Props = {
   companies: GroupPresenter[]
   emblaRef
}

export const FeaturedCompaniesCarousel = ({ companies, emblaRef }: Props) => {
   const followingCompanies = useUserFollowingCompanies()

   return (
      <Box sx={styles.carouselRoot} ref={emblaRef}>
         <Stack direction={"row"} spacing={"32px"}>
            {companies.map((company) => (
               <FeaturedCompanyCard
                  key={company.id}
                  company={company}
                  following={Boolean(
                     followingCompanies.find(
                        (data) => data.groupId === company.id
                     )
                  )}
               />
            ))}
         </Stack>
      </Box>
   )
}

type FeaturedCompanyCardProps = {
   company: GroupPresenter
   following: boolean
}

export const FeaturedCompanyCard = ({
   company,
   following,
}: FeaturedCompanyCardProps) => {
   const { userData } = useAuth()
   const { data: group } = useGroup(company.id, true)

   const industries = company.companyIndustries
      .map((industry) => industry.name)
      .join(", ")

   const toggleFollow = useCallback(
      async (e: React.MouseEvent, groupId: string) => {
         e.stopPropagation()
         e.preventDefault()

         if (following) {
            await groupRepo.unfollowCompany(userData.id, groupId)
         } else {
            await groupRepo.followCompany(userData, group).then(() => {
               dataLayerEvent("featured_company_follow", {
                  companyId: groupId,
                  companyName: company.universityName,
                  userId: userData.id,
               })
            })
         }
      },
      [userData, group, following, company.universityName]
   )

   return (
      <Link
         onClick={() => {
            dataLayerEvent("featured_company_view", {
               companyId: company.id,
               companyName: company.universityName,
               userId: userData.id,
            })
         }}
         href={`/company/${companyNameSlugify(company.universityName)}`}
         target="_blank"
      >
         <Stack
            direction="row"
            spacing={2}
            sx={styles.companyCardRoot}
            alignItems={"center"}
         >
            <Avatar src={company.logoUrl} sx={styles.companyLogo} />
            <Stack sx={{ flex: 1, minWidth: 0 }}>
               <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
                  <Typography variant="medium" sx={styles.companyName}>
                     {company.universityName}
                  </Typography>
                  {company.publicSparks ? (
                     <FeaturedCompanySparksBadge sx={styles.badge} />
                  ) : null}
               </Stack>
               <Typography variant="small" sx={styles.companyIndustries}>
                  {industries}
               </Typography>
               <Typography variant="small" sx={styles.companyCountry}>
                  {company.companyCountry?.name}
               </Typography>
            </Stack>
            <Button
               variant="contained"
               sx={[
                  styles.followButton,
                  following ? styles.followingButton : null,
               ]}
               onClick={(e) => toggleFollow(e, company.id)}
            >
               <Typography
                  variant="small"
                  fontWeight={400}
                  sx={{ color: (theme) => theme.brand.white[100] }}
               >
                  {following ? "Unfollow" : "Follow"}
               </Typography>
            </Button>
         </Stack>
      </Link>
   )
}
