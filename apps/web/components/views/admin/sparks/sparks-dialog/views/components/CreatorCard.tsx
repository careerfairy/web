import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Button, Stack, Typography } from "@mui/material"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
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
      bgcolor: "background.paper",
      justifyContent: "space-between",
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
      width: {
         xs: "100%",
         sm: "auto",
      },
   },
   creatorDetailsWrapper: {
      display: "flex",
      width: {
         xs: "100%",
         md: "auto",
      },
   },
})

type Props = {
   creator: PublicCreator
   onClick: () => void
}

const CreatorCard: FC<Props> = ({ creator, onClick }) => {
   const displayName = `${creator.firstName} ${creator.lastName}`

   return (
      <Stack
         direction={{
            xs: "column",
            md: "row",
         }}
         sx={styles.creatorCard}
         spacing={3}
      >
         <Box sx={styles.creatorDetailsWrapper}>
            <CreatorAvatar creator={creator} sx={styles.creatorCardAvatar} />
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
                  {creator.id}
               </Typography>
            </Box>
         </Box>
         <Box>
            <Button
               sx={styles.creatorCardBtn}
               variant="outlined"
               color="secondary"
               onClick={onClick}
               size="small"
            >
               Change creator
            </Button>
         </Box>
      </Stack>
   )
}

export default CreatorCard
