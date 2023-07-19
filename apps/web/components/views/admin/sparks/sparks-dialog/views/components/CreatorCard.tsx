import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Avatar, Box, CardMedia } from "@mui/material"
import { CardContent } from "@mui/material"
import { Typography } from "@mui/material"
import { CardActionArea } from "@mui/material"
import { Card } from "@mui/material"
import Image from "next/image"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   creatorCard: {
      display: "flex",
      flexDirection: "row",
      borderRadius: 4,
      border: "1px solid #ECECEC",
   },
   creatorCardActionArea: {
      p: 2,
      display: "flex",
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-start",
   },
   creatorCardContent: {
      p: 0,
      pl: 2.5,
   },
   creatorCardAvatar: {
      width: 80,
      height: 80,
   },
   displayName: {
      color: "#212020",
      fontSize: "1.42857rem",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "1.42857rem",
   },
   position: {
      color: "#787878",
      fontSize: "1.14286rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.42857rem",
   },
   email: {
      color: "#787878",
      fontSize: "1rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.42857rem",
   },
})

type Props = {
   creator: Creator
   onClick: () => void
}

const CreatorCard: FC<Props> = ({ creator, onClick }) => {
   const displayName = `${creator.firstName} ${creator.lastName}`

   return (
      <Card elevation={0} sx={styles.creatorCard} onClick={onClick}>
         <CardActionArea sx={styles.creatorCardActionArea}>
            <CardMedia image={creator.avatarUrl} title={displayName} />
            <Avatar alt={displayName} sx={styles.creatorCardAvatar}>
               {creator.avatarUrl ? (
                  <Image
                     src={creator.avatarUrl}
                     alt={displayName}
                     layout="fill"
                  />
               ) : (
                  `${creator.firstName[0]} ${creator.lastName[0]}`
               )}
            </Avatar>
            <CardContent sx={styles.creatorCardContent}>
               <Typography sx={styles.displayName} component="h2">
                  {creator.firstName} {creator.lastName}
               </Typography>
               <Box mt={0.75} />
               <Typography sx={styles.position} component="p">
                  {creator.position}
               </Typography>
               <Box mt={1} />
               <Typography sx={styles.email} component="p">
                  {creator.email}
               </Typography>
            </CardContent>
         </CardActionArea>
      </Card>
   )
}

export default CreatorCard
