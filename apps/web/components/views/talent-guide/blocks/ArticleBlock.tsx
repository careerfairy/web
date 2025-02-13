import { Box, IconButton, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { ArticleBlockType } from "data/hygraph/types"
import Link from "next/link"
import { ChevronRight, Circle } from "react-feather"
import { useTalentGuideState } from "store/selectors/talentGuideSelectors"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerLevelEvent } from "util/analyticsUtils"
import { BlockWithAuthorPromotion } from "./BlockWithAuthorPromotions"

const ILLUSTRATION_WIDTH = "108px"
const GAP = "12px"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      borderRadius: "8px !important",
      overflow: "hidden",
      gap: GAP,
      paddingRight: "8px",
      backgroundColor: "white",
   },
   contentContainer: {
      width: `calc(100% - ${ILLUSTRATION_WIDTH} - ${GAP})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
      gap: "4px",
      paddingTop: "12px",
      paddingBottom: "12px",
   },
   imageContainer: {
      width: ILLUSTRATION_WIDTH,
   },
   authorContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
   },
   authorTextContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "4px",
      color: "neutral.600",
   },
   titleContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      color: "neutral.800",
   },
   iconButtonContainer: {
      justifyContent: "end !important",
      alignContent: "end !important",
      alignSelf: "end !important",
      justifySelf: "end !important",
   },
   iconButton: {
      backgroundColor: "primary.main",
      color: "white",
      "&:hover": {
         backgroundColor: "primary.dark",
      },
   },
})

type Props = ArticleBlockType

const Content = ({
   illustration,
   title,
   articleUrl,
   authorAvatar,
   authorName,
   id,
}: Props) => {
   const talentGuideState = useTalentGuideState()

   return (
      <Box
         sx={styles.root}
         component={Link}
         onClick={() => {
            dataLayerLevelEvent(
               AnalyticsEvents.LevelsProgressArticle,
               talentGuideState,
               {
                  articleId: id,
                  articleUrl: articleUrl,
               }
            )
         }}
         href={articleUrl}
         target="_blank"
      >
         <Box
            sx={[
               styles.imageContainer,
               {
                  backgroundImage: `url(${illustration.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: ILLUSTRATION_WIDTH,
               },
            ]}
            aria-label={illustration.alt}
         />
         <Box sx={styles.contentContainer}>
            <Box sx={styles.authorContainer}>
               <CircularLogo
                  src={authorAvatar?.url}
                  alt={authorAvatar?.alt}
                  size={20}
               />
               <Box sx={styles.authorTextContainer}>
                  <Typography variant="xsmall">{authorName}</Typography>
                  <Circle size={3} fill="#ADADC1" stroke="#ADADC1" />
                  <Typography variant="xsmall">Article</Typography>
               </Box>
            </Box>
            <Box sx={styles.titleContainer}>
               <Typography variant="small">{title}</Typography>
               <Box sx={styles.iconButtonContainer}>
                  <IconButton sx={styles.iconButton} size="small">
                     <ChevronRight size={15} />
                  </IconButton>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export const ArticleBlock = (props: Props) => {
   return (
      <BlockWithAuthorPromotion {...props}>
         <Content {...props} />
      </BlockWithAuthorPromotion>
   )
}
