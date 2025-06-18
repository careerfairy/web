import { Creator } from "@careerfairy/shared-lib/groups/creators"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import {
   Box,
   BoxProps,
   Divider,
   Skeleton,
   Stack,
   Typography,
} from "@mui/material"
import { useCreator } from "components/custom-hook/creator/useCreator"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import CircularLogo from "../common/logos/CircularLogo"

const styles = sxStyles({
   root: {
      display: "flex",
      position: "relative",

      borderRadius: 2,
      border: "1px solid #F8F8F8",
      p: 3.5,
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
      my: "auto",
   },
   fullName: {
      fontSize: "1.71429rem",
      fontWeight: 600,
      lineHeight: "1.42857rem",
   },
   linkedIn: {
      color: "#0066C8",
      flexWrap: "nowrap",
      display: "flex",
      alignItems: "center",
      "& p": {
         color: "inherit",
         ml: 1,
      },
   },
   details: {
      fontSize: "1.14286rem",
      fontWeight: 400,
      lineHeight: "1.42857rem",
   },
   story: {
      fontSize: "1.14286rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
      letterSpacing: "0.00821rem",
      textAlign: "center",
      whiteSpace: "pre-wrap",
   },
})

const AVATAR_SIZE = 136

type Props = {
   creator?: Creator
   children?: ReactNode
} & BoxProps

export const CreatorPreview = ({ creator, sx, children, ...rest }: Props) => {
   const { data, isLoading } = useCreator(creator?.groupId, creator?.id)
   return (
      <Box sx={combineStyles(styles.root, sx)} {...rest}>
         {creator ? (
            <CircularLogo
               size={AVATAR_SIZE}
               src={creator.avatarUrl}
               alt={`${creator.firstName} ${creator.lastName}`}
               objectFit="cover"
            />
         ) : (
            <Skeleton
               variant="circular"
               width={AVATAR_SIZE}
               height={AVATAR_SIZE}
               animation="wave"
            />
         )}
         <Box mt={2.85} />
         <Typography sx={styles.fullName} component="h4">
            {creator ? (
               `${creator.firstName} ${creator.lastName}`
            ) : (
               <Skeleton variant="text" animation="wave" width={180} />
            )}
         </Typography>
         <Box mt={2} />
         <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1.5}
         >
            {creator ? (
               <Details>{creator.position}</Details>
            ) : (
               <Skeleton variant="text" animation="wave" />
            )}
            {creator?.linkedInUrl ? (
               <Box
                  component="a"
                  target="_blank"
                  href={creator.linkedInUrl}
                  sx={styles.linkedIn}
               >
                  <LinkedInIcon />
                  <Typography>Linked</Typography>
               </Box>
            ) : null}
         </Stack>
         <Box mt={2} />
         {isLoading ? (
            <Details>
               <Skeleton variant="text" animation="wave" />
            </Details>
         ) : data ? (
            <Details>{data?.email}</Details>
         ) : null}
         <Box mt={2} />
         <Typography sx={styles.story}>
            {creator ? (
               creator.story
            ) : (
               <Skeleton variant="text" animation="wave" />
            )}
         </Typography>
         {children}
      </Box>
   )
}

type DetailsProps = {
   children: ReactNode
}

const Details = ({ children }: DetailsProps) => (
   <Typography variant="body2" color="text.secondary" sx={styles.details}>
      {children}
   </Typography>
)
