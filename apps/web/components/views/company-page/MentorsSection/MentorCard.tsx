import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, SyntheticEvent } from "react"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "util/routes"
import { useCompanyPage } from ".."

const CARD_WIDTH = 240

const styles = sxStyles({
   container: (theme) => ({
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: `${theme.brand.white[100]}`,
      borderRadius: "10px",
      border: `1px solid ${theme.palette.secondary.light}`,
      boxShadow: "0px 0px 8px 0px #1414140F",
      minWidth: `${CARD_WIDTH}px`,
      height: "194px",
      padding: "16px",
      gap: 1,
      userSelect: "none",
      cursor: "pointer",
      textDecoration: "none",
      color: "inherit",
      overflow: "hidden",
      transform: "translateZ(0)",
   }),
   bannerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "66px",
      overflow: "hidden",
      zIndex: 1,
      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         background: "rgba(142, 142, 142, 0.50)",
         WebkitBackdropFilter: "blur(10px)",
         backdropFilter: "blur(10px)",
      },
   },
   creator: {
      name: {
         maxWidth: "200px",
         fontWeight: 700,
         textAlign: "center",
         textOverflow: "ellipsis",
         whiteSpace: "nowrap",
         overflow: "hidden",
      },
      position: {
         fontSize: "14px",
         fontWeight: 400,
         lineHeight: "21px",
         textAlign: "center",
         color: "neutral.600",
         paddingBottom: 1,
         marginBottom: -1,
         maxWidth: "100%",
         display: "-webkit-box",
         WebkitLineClamp: 2,
         WebkitBoxOrient: "vertical",
         overflow: "hidden",
      },
   },
   edit: {
      position: "absolute",
      right: 4,
      top: 4,
      zIndex: 1,
   },
   logoOverlay: {
      position: "absolute",
      bottom: 1,
      right: 2,
      zIndex: 3,
      border: (theme) => `2px solid ${theme.brand.white[100]}`,
      borderRadius: "50%",
   },
   avatarContainer: {
      position: "relative",
      zIndex: 2,
      transform: "translateZ(0)",
   },
})

type ContainerProps = Pick<MentorCardProps, "creator"> & {
   children: ReactNode
}

const Container = ({ creator, children }: ContainerProps) => {
   const { editMode, group } = useCompanyPage()

   const mentorPageLink = buildMentorPageLink({
      universityName: group?.universityName || "",
      firstName: creator.firstName,
      lastName: creator.lastName,
      creatorId: creator.id,
   })

   return editMode ? (
      <Box sx={[styles.container, { cursor: "auto" }]}>{children}</Box>
   ) : (
      <Box sx={styles.container} component={Link} href={mentorPageLink}>
         {children}
      </Box>
   )
}

type MentorCardProps = {
   creator: PublicCreator
   isEditMode?: boolean
   handleEdit?: () => void
}

export const MentorCard = ({
   creator,
   isEditMode,
   handleEdit,
}: MentorCardProps) => {
   const creatorName = `${creator.firstName} ${creator.lastName}`
   const theme = useTheme()
   const { group } = useCompanyPage()

   const _handleEdit = (ev: SyntheticEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      handleEdit?.()
   }

   return (
      <Container creator={creator}>
         {group?.bannerImageUrl ? (
            <Box sx={styles.bannerContainer}>
               <Image
                  src={group.bannerImageUrl}
                  alt=""
                  objectFit="cover"
                  className="bannerImage"
                  priority
                  fill
                  style={{
                     width: "100%",
                     height: "100%",
                     objectFit: "cover",
                  }}
               />
            </Box>
         ) : null}
         {isEditMode ? (
            <IconButton sx={styles.edit} onClick={_handleEdit}>
               <Edit2 size={20} color={theme.brand.white[100]} />
            </IconButton>
         ) : null}
         <Box sx={styles.avatarContainer}>
            <CircularLogo
               size={84}
               src={creator.avatarUrl}
               alt={`Picture of creator ${creatorName}`}
               objectFit="cover"
               key={creator.avatarUrl}
            />
            {group?.logoUrl ? (
               <CircularLogo
                  size={28}
                  src={group.logoUrl}
                  alt={`Logo of ${group.universityName}`}
                  objectFit="cover"
                  sx={styles.logoOverlay}
               />
            ) : null}
         </Box>
         <Typography
            variant="brandedH5"
            sx={[styles.creator.name, { position: "relative", zIndex: 1 }]}
         >
            {creatorName}
         </Typography>
         <Typography
            sx={[styles.creator.position, { position: "relative", zIndex: 1 }]}
         >
            {creator.position.concat(" at ")}
            <Typography component="span" fontWeight={600} color={"neutral.600"}>
               {group?.universityName}
            </Typography>
         </Typography>
      </Container>
   )
}

MentorCard.width = CARD_WIDTH
