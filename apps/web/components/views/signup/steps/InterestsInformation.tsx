import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { TagsSelector } from "../userInformation/tags/TagsSelector"

const BUSINESS_FUNCTIONS_INTERESTS_LABEL =
   "What kind of work are you excited about?"

const CONTENT_TOPIC_INTERESTS_LABEL =
   "Choose the topics that spark your curiosity!"

const styles = sxStyles({
   label: {
      color: (theme) => theme.palette.neutral[900],
      fontFamily: "Poppins",
      fontSize: "11.2px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "14.94px",
      textTransform: "uppercase",
   },
})
const InterestsInformation = () => {
   const { userData } = useAuth()

   return (
      <ConditionalWrapper condition={Boolean(userData)}>
         <Stack
            gap={"32px"}
            direction={"column"}
            spacing={2}
            data-testid={"registration-interests-information-step"}
         >
            <TagsSelector
               tags={ContentTopicsTagValues}
               field="contentTopicsTagIds"
               label={CONTENT_TOPIC_INTERESTS_LABEL}
               labelSx={styles.label}
            />
            <TagsSelector
               tags={BusinessFunctionsTagValues}
               field="businessFunctionsTagIds"
               label={BUSINESS_FUNCTIONS_INTERESTS_LABEL}
               labelSx={styles.label}
            />
         </Stack>
      </ConditionalWrapper>
   )
}

export default InterestsInformation
