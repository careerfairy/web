import { Box, Stack, Typography } from "@mui/material"
import { speakerPlaceholder } from "components/util/constants"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { AuthorPromotionComponentType } from "data/hygraph/types"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      borderRadius: "8px",
      padding: "12px 8px 8px 8px",
      maxWidth: "100%",
      overflow: "hidden",
   },
   wrapper: {
      display: "flex",
      gap: "4px",
      alignItems: "center",
      justifyContent: "center",
   },
   authorName: {
      color: "neutral.800",
      fontWeight: 600,
   },
})

type Props = Pick<
   AuthorPromotionComponentType,
   "authorName" | "authorAvatar" | "backgroundColor"
> & {
   children?: ReactNode
}

export const AuthorPromotion = ({
   authorName,
   authorAvatar,
   backgroundColor,
   children,
}: Props) => {
   return (
      <Box
         sx={[
            styles.root,
            {
               backgroundColor: backgroundColor
                  ? `rgba(${backgroundColor.rgba.r}, ${backgroundColor.rgba.g}, ${backgroundColor.rgba.b}, ${backgroundColor.rgba.a})`
                  : "white",
            },
         ]}
      >
         <Stack sx={styles.wrapper} direction="column">
            <Typography variant="medium" sx={styles.authorName}>
               Exklusive Einblicke von:
            </Typography>
            <Stack sx={styles.wrapper} direction="row">
               <CircularLogo
                  src={authorAvatar?.url || speakerPlaceholder}
                  alt={authorName}
                  size={40}
               />
               <Typography variant="brandedBody" color="neutral.800">
                  {authorName}
               </Typography>
            </Stack>
         </Stack>
         {children}
      </Box>
   )
}
