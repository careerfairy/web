import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { CompanyFollowed } from "@careerfairy/shared-lib/users"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { Box, Button, Divider, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useUserFollowingCompanies } from "components/custom-hook/user/useUserFollowingCompanies"
import { CompanyIcon } from "components/views/common/icons"
import ProfileCompaniesPublicSparksBadge from "components/views/common/icons/ProfileCompaniesPublicSparksBadge"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { groupRepo } from "data/RepositoryInstances"
import Link from "next/link"
import { Fragment, useCallback } from "react"
import { MapPin, Tag, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { EmptyItemView } from "../Profile/EmptyItemView"
import { ProfileSection } from "../Profile/ProfileSection"

const styles = sxStyles({
   emptyCompaniesRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   icon: {
      width: "36px",
      height: "36px",
   },
   title: {
      color: (theme) => theme.palette.neutral[900],
      fontWeight: 600,
   },
   companyCardRoot: {
      p: "12px 8px 12px 8px",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
   },
   companyName: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
   },
   publicSparksBadge: {
      width: "16px !important",
      height: "16px !important",
   },
   companyInfoText: {
      color: (theme) => theme.palette.neutral[600],
      fontWeight: 400,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
   },
   companyInfoIcon: {
      color: (theme) => theme.palette.neutral[600],
      minWidth: "12px !important",
      minHeight: "12px !important",
      width: "12px",
      height: "12px",
   },
   divider: {
      borderColor: (theme) => theme.brand.black[200],
   },
   unfollowBtn: {
      minWidth: "fit-content",
      width: "fit-content",
      height: "fit-content",
      fontSize: "14px",
      ml: 2,
      p: "8px 16px",
      flexShrink: 0,
      backgroundColor: (theme) => theme.brand.white[100],
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      color: (theme) => theme.palette.neutral[500],
      "&:hover": {
         borderColor: (theme) => theme.palette.neutral[50],
         backgroundColor: (theme) => theme.brand.black[400],
      },
   },
})

export const ProfileFollowingCompaniesDetailsView = () => {
   const followingCompanies = useUserFollowingCompanies()

   return (
      <Box m={"20px"}>
         <ProfileSection
            showAddIcon={false}
            title={"Followed companies"}
            count={followingCompanies.length}
         >
            <ProfileFollowingCompanies />
         </ProfileSection>
      </Box>
   )
}

const ProfileFollowingCompanies = () => {
   const followingCompanies = useUserFollowingCompanies()

   if (!followingCompanies.length)
      return (
         <Box sx={styles.emptyCompaniesRoot}>
            <EmptyItemView
               title="No companies followed yet"
               description="Follow companies to stay up-to-date on their job openings and news."
               icon={<CompanyIcon sx={styles.icon} />}
            />
         </Box>
      )

   return (
      <ProfileFollowingCompaniesList followingCompanies={followingCompanies} />
   )
}

type ProfileFollowingCompaniesListProps = {
   followingCompanies: CompanyFollowed[]
}

const ProfileFollowingCompaniesList = ({
   followingCompanies,
}: ProfileFollowingCompaniesListProps) => {
   return (
      <Stack>
         {followingCompanies.map((companyFollowed, idx) => {
            return (
               <Fragment key={companyFollowed.groupId}>
                  <FollowingCompanyCard group={companyFollowed.group} />
                  {idx < followingCompanies.length - 1 ? (
                     <Divider sx={styles.divider} />
                  ) : null}
               </Fragment>
            )
         })}
      </Stack>
   )
}

type FollowingCompanyCardProps = {
   group: PublicGroup
}

const FollowingCompanyCard = ({ group }: FollowingCompanyCardProps) => {
   const { userData } = useAuth()

   const companyLink = `/company/${companyNameSlugify(group.universityName)}`

   const handleUnfollow = useCallback(
      async (e: React.MouseEvent) => {
         e.stopPropagation()
         e.preventDefault()
         await groupRepo.unfollowCompany(userData.id, group.id)
      },
      [userData.id, group.id]
   )

   return (
      <Link href={companyLink} target="_blank">
         <Stack direction={"row"} sx={styles.companyCardRoot}>
            <Stack
               direction={"row"}
               alignItems={"center"}
               spacing={1.5}
               sx={{ flex: 1, minWidth: 0 }}
            >
               <CircularLogo src={group.logoUrl} alt="Company logo" size={48} />
               <Stack sx={{ minWidth: 0 }}>
                  <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                     <Typography sx={styles.companyName} variant="small">
                        {group.universityName}
                     </Typography>
                     {group.publicSparks ? (
                        <ProfileCompaniesPublicSparksBadge
                           sx={styles.publicSparksBadge}
                        />
                     ) : null}
                  </Stack>
                  <FollowingCompanyCardInfo
                     icon={MapPin}
                     text={group.companyCountry?.name}
                  />
                  <FollowingCompanyCardInfo
                     icon={Tag}
                     text={group.companyIndustries
                        ?.map((industry) => industry.name)
                        ?.join(", ")}
                  />
                  <FollowingCompanyCardInfo
                     icon={Users}
                     text={group.companySize}
                  />
               </Stack>
            </Stack>

            <Button
               sx={styles.unfollowBtn}
               variant="outlined"
               onClick={handleUnfollow}
            >
               Unfollow
            </Button>
         </Stack>
      </Link>
   )
}

type FollowingCompanyCardInfoProps = {
   icon: React.ElementType
   text: string
}

const FollowingCompanyCardInfo = ({
   icon: IconComponent,
   text,
}: FollowingCompanyCardInfoProps) => {
   return (
      <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
         <Box component={IconComponent} sx={styles.companyInfoIcon} />
         <Typography variant="xsmall" sx={styles.companyInfoText}>
            {text}
         </Typography>
      </Stack>
   )
}
