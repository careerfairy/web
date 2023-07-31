import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Stack, Typography } from "@mui/material"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {},
   creatorCardAvatar: {
      height: {
         xs: 52,
         md: 64,
      },
      width: {
         xs: 52,
         md: 64,
      },
   },
   displayName: {
      color: "#121212",
      textEdge: "cap",
      fontSize: {
         xs: "1.42857rem",
         md: "1.71429rem",
      },
      fontWeight: 500,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
   },
   position: {
      color: "#707070",
      textEdge: "cap",
      fontSize: {
         xs: "1rem",
         md: "1.14286rem",
      },
      fontWeight: 400,
      lineHeight: "117.5%",
      letterSpacing: "-0.03121rem",
   },
})

type Props = {
   creator: Creator
}

const CreatorDetails: FC<Props> = ({ creator }) => {
   return (
      <Stack spacing={1.25} alignItems="center" direction="row">
         <CreatorAvatar creator={creator} sx={styles.creatorCardAvatar} />
         <Box>
            <Typography
               sx={styles.displayName}
               component="h5"
            >{`${creator.firstName} ${creator.lastName}`}</Typography>
            <Typography sx={styles.position} component="p">
               {creator.position}
            </Typography>
         </Box>
      </Stack>
   )
}

export default CreatorDetails
