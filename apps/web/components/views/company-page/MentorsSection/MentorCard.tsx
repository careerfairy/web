import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"

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
      minWidth: "214px",
      height: "194px",
      padding: "16px",
      gap: 1,
      userSelect: "none",
      cursor: "pointer",
   }),
   creator: {
      name: {
         width: "100%",
         fontSize: "20px",
         fontWeight: 600,
         lineHeight: "30px",
         textAlign: "center",
         textOverflow: "ellipsis",
         overflow: "hidden",
         whiteSpace: "nowrap",
      },
      position: {
         fontSize: "14px",
         fontWeight: 400,
         lineHeight: "20px",
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

type MentorCardProps = {
   key: string
   creator: PublicCreator
   isEditMode?: boolean
}

export const MentorCard = ({ key, creator, isEditMode }: MentorCardProps) => {
   const creatorName = `${creator.firstName} ${creator.lastName}`
   const theme = useTheme()

   const handleEdit = () => {
      alert("Will open edit dialog")
   }

   return (
      <Box key={key} sx={styles.container}>
         {Boolean(isEditMode) && (
            <IconButton sx={styles.edit} onClick={handleEdit}>
               <Edit2 size={20} color={theme.palette.neutral[700]} />
            </IconButton>
         )}
         <CircularLogo
            size={80}
            src={creator.avatarUrl}
            alt={`Picture of creator ${creatorName}`}
            objectFit="cover"
         />
         <Typography sx={styles.creator.name}>{creatorName}</Typography>
         <Typography sx={styles.creator.position}>
            {creator.position}
         </Typography>
      </Box>
   )
}
