import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Link from "next/link"
import { ReactNode, SyntheticEvent } from "react"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "util/routes"
import { useCompanyPage } from ".."

const CARD_WIDTH = 214

const mentorsCardBackground =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fmentors-card-background.png?alt=media&token=a38f0348-61db-4317-a65e-392dbc44b38a"

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
   }),
   topBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "66px",
      backgroundImage: `url(${mentorsCardBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: 0,
      "&::before": {
         content: "''",
         position: "absolute",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         background: "rgba(142, 142, 142, 0.10)",
         backdropFilter: "blur(10px)",
      },
   },
   creator: {
      name: {
         width: "100%",
         fontWeight: 700,
         textAlign: "center",
         textOverflow: "ellipsis",
         overflow: "hidden",
         whiteSpace: "nowrap",
      },
      position: {
         fontSize: "14px",
         fontWeight: 400,
         lineHeight: "21px",
         textAlign: "center",
         color: "neutral.600",
         // css hack to ensure text is not cut off
         paddingBottom: 1,
         marginBottom: -1,
         ...getMaxLineStyles(2),
      },
   },
   edit: {
      position: "absolute",
      right: 4,
      top: 4,
   },
   logoOverlay: {
      position: "absolute",
      bottom: 1,
      right: 2,
      zIndex: 2,
      border: (theme) => `2px solid ${theme.brand.white[100]}`,
      borderRadius: "50%",
   },
   avatarContainer: {
      position: "relative",
      zIndex: 1,
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
         <Box sx={styles.topBackground} />
         {Boolean(isEditMode) && (
            <IconButton sx={styles.edit} onClick={_handleEdit}>
               <Edit2 size={20} color={theme.brand.white[100]} />
            </IconButton>
         )}
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
            <Typography fontWeight={600} color={"neutral.600"}>
               {group?.universityName}
            </Typography>
         </Typography>
      </Container>
   )
}

MentorCard.width = CARD_WIDTH
