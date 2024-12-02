import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode, SyntheticEvent } from "react"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "utils/routes"
import { useCompanyPage } from ".."

const CARD_WIDTH = 214

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
   }),
   creator: {
      name: {
         width: "100%",
         fontWeight: 600,
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
         color: "neutral.400",
         ...getMaxLineStyles(2),
         // css hack to ensure text is not cut off
         paddingBottom: 1,
         marginBottom: -1,
      },
   },
   edit: {
      position: "absolute",
      right: 4,
      top: 4,
   },
})

type ContainerProps = Pick<MentorCardProps, "creator"> & {
   children: ReactNode
}

const Container = ({ creator, children }: ContainerProps) => {
   const router = useRouter()
   const { editMode } = useCompanyPage()

   const mentorPageLink = buildMentorPageLink({
      universityName: router.query.companyName as string,
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

   const _handleEdit = (ev: SyntheticEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      handleEdit?.()
   }

   return (
      <Container creator={creator}>
         {Boolean(isEditMode) && (
            <IconButton sx={styles.edit} onClick={_handleEdit}>
               <Edit2 size={20} color={theme.palette.neutral[700]} />
            </IconButton>
         )}
         <CircularLogo
            size={80}
            src={creator.avatarUrl}
            alt={`Picture of creator ${creatorName}`}
            objectFit="cover"
            key={creator.avatarUrl}
         />
         <Typography variant="brandedH4" sx={styles.creator.name}>
            {creatorName}
         </Typography>
         <Typography sx={styles.creator.position}>
            {creator.position}
         </Typography>
      </Container>
   )
}

MentorCard.width = CARD_WIDTH
