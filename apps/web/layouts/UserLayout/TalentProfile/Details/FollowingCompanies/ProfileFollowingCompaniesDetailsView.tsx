import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { Button, Stack, Typography, useTheme } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useUserFollowingCompanies } from "components/custom-hook/user/useUserFollowingCompanies"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { groupRepo } from "data/RepositoryInstances"
import { useCallback } from "react"
import { Icon, MapPin, Tag, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
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
      "& svg": {
         width: "12px",
         height: "12px",
      },
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
      <Stack spacing={1.5} m={"20px"}>
         <Typography sx={styles.title} variant="brandedBody">
            Following companies
         </Typography>
         <ProfileFollowingCompaniesList />
      </Stack>
   )
}

const ProfileFollowingCompaniesList = () => {
   const followingCompanies = useUserFollowingCompanies()
   console.log(
      "🚀 ~ ProfileFollowingCompaniesList ~ followingCompanies:",
      followingCompanies
   )

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

   const handleUnfollow = useCallback(async () => {
      await groupRepo.unfollowCompany(userData.id, group.id)
   }, [userData.id, group.id])

   return (
      <Stack direction={"row"} sx={styles.companyCardRoot}>
         <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
            <CircularLogo src={group.logoUrl} alt="Company logo" />
            <Stack>
               <Typography sx={styles.companyName} variant="small">
                  {group.universityName}
               </Typography>
               {/* <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
                  <MapPin size={12} color={theme.palette.neutral[600]} />
                  <Typography variant="small" sx={styles.companyInfoText}>{group.companyCountry?.name}</Typography>
               </Stack> */}
               <FollowingCompanyCardInfo
                  icon={MapPin}
                  text={group.companyCountry?.name}
               />
               <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
                  <Tag size={12} />
                  <Typography>
                     {group.companyIndustries
                        ?.map((industry) => industry.name)
                        ?.join(", ")}
                  </Typography>
               </Stack>
               <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
                  <Users size={12} />
                  <Typography>{group.companySize}</Typography>
               </Stack>
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
   )
}

type FollowingCompanyCardInfoProps = {
   icon: Icon
   text: string
}

const FollowingCompanyCardInfo = ({
   icon,
   text,
}: FollowingCompanyCardInfoProps) => {
   const theme = useTheme()

   return (
      <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
         {icon({ size: 12, color: theme.palette.neutral[600] })}
         <Typography variant="small" sx={styles.companyInfoText}>
            {text}
         </Typography>
      </Stack>
   )
}
