import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { CompanyFollowed } from "@careerfairy/shared-lib/users"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useUserFollowingCompanies } from "components/custom-hook/user/useUserFollowingCompanies"
import { CompanyIcon } from "components/views/common/icons"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { groupRepo } from "data/RepositoryInstances"
import Link from "next/link"
import { useCallback } from "react"
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
      p: "12px 8px 12px 16px",
      justifyContent: "space-between",
      alignItems: "center",
   },
   companyName: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 600,
   },
   companyInfoText: {
      color: (theme) => theme.palette.neutral[600],
      fontWeight: 400,
   },
   companyInfoIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "12px",
      height: "12px",
   },
   unfollowBtn: {
      width: "fit-content",
      height: "fit-content",
      fontSize: "14px",
      p: "8px 16px",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      color: (theme) => theme.palette.neutral[500],
      "&:hover": {
         borderColor: (theme) => theme.palette.neutral[50],
         backgroundColor: (theme) => theme.brand.black[400],
      },
   },
})

export const ProfileFollowingCompaniesDetailsView = () => {
   return (
      <Box m={"20px"}>
         <ProfileSection showAddIcon={false} title="Following companies">
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
         {followingCompanies.map((companyFollowed) => (
            <FollowingCompanyCard
               group={companyFollowed.group}
               key={companyFollowed.groupId}
            />
         ))}
      </Stack>
   )
}

type FollowingCompanyCardProps = {
   group: PublicGroup
}

const FollowingCompanyCard = ({ group }: FollowingCompanyCardProps) => {
   const { userData } = useAuth()

   const companyLink = `/company/${companyNameSlugify(group.universityName)}`

   const handleUnfollow = useCallback(async () => {
      await groupRepo.unfollowCompany(userData.id, group.id)
   }, [userData.id, group.id])

   return (
      <Stack direction={"row"} sx={styles.companyCardRoot}>
         <Link href={companyLink} target="_blank">
            <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
               <CircularLogo src={group.logoUrl} alt="Company logo" size={48} />
               <Stack>
                  <Typography sx={styles.companyName} variant="small">
                     {group.universityName}
                  </Typography>
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
         </Link>
         <Button
            sx={styles.unfollowBtn}
            variant="outlined"
            onClick={handleUnfollow}
         >
            Unfollow
         </Button>
      </Stack>
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
