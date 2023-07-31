import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import Image from "next/image"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   creatorCard: {
      display: "flex",
      flexDirection: "row",
      borderRadius: 4,
      border: "1px solid #ECECEC",
      p: 2,
      alignItems: "center",
   },
   creatorCardActionArea: {
      display: "flex",
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-start",
   },
   creatorCardContent: {
      p: 0,
      pl: 2.5,
      pb: 0,
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
   creatorCardBtn: {
      ml: "auto",
      fontSize: {
         xs: "0.85714rem",
         sm: "1rem",
      },
      fontWeight: 400,
      lineHeight: "1.42857rem",
      padding: {
         xs: "6px 12px",
         sm: "8px 16px",
      },
      textTransform: "none",
   },
})

type Props = {
   creator: Creator
   onClick: () => void
}

const CreatorCard: FC<Props> = ({ creator, onClick }) => {
   const displayName = `${creator.firstName} ${creator.lastName}`
   const isMobile = useIsMobile()

   return (
      <Stack direction="row" sx={styles.creatorCard}>
         <Avatar alt={displayName} sx={styles.creatorCardAvatar}>
            {creator.avatarUrl ? (
               <Image
                  src={getResizedUrl(creator.avatarUrl, "sm")}
                  alt={displayName}
                  layout="fill"
               />
            ) : (
               `${creator.firstName[0]} ${creator.lastName[0]}`
            )}
         </Avatar>
         <Box sx={styles.creatorCardContent}>
            <Typography sx={styles.displayName} component="h2">
               {displayName}
            </Typography>
            <Box mt={0.75} />
            <Typography sx={styles.position} component="p">
               {creator.position}
            </Typography>
            <Box mt={1} />
            <Typography sx={styles.email} component="p">
               {creator.email}
            </Typography>
         </Box>
         <Button
            sx={styles.creatorCardBtn}
            variant="outlined"
            color="secondary"
            onClick={onClick}
            size="small"
         >
            {isMobile ? "change" : "change creator"}
         </Button>
      </Stack>
   )
}

export default CreatorCard
