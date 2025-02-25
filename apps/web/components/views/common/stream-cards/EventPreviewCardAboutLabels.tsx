import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"

import { Skeleton, Stack } from "@mui/material"
import { Globe } from "react-feather"
import { sxStyles } from "types/commonTypes"
import WhiteTagChip from "../chips/TagChip"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"

const styles = sxStyles({
   chipsWrapper: {
      display: "flex",
      alignItems: "flex-start",
      alignSelf: "stretch",
      mt: "auto",
   },
   chipLoader: {
      height: 40,
      width: 50,
      borderRadius: 4,
   },
   chip: {
      color: (theme) => theme.palette.neutral[500],
      border: (theme) => `1px solid ${theme.palette.neutral[400]}`,
      height: "unset",
      padding: "4px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "4px",
      "& .MuiChip-label": {
         fontSize: 12,
         fontWeight: 400,
         lineHeight: "16px",
         padding: 0,
      },
      "& .MuiChip-icon": {
         margin: 0,
         width: "14px",
         height: "14px",
      },
   },
})

const EventPreviewCardAboutLabels = () => {
   const { livestream, loading, animation, isPast } =
      useEventPreviewCardContext()
   return (
      <Stack
         className="chipsWrapper"
         spacing={1}
         direction={"row"}
         sx={styles.chipsWrapper}
      >
         {loading ? (
            <>
               <Skeleton animation={animation} sx={styles.chipLoader} />
               <Skeleton animation={animation} sx={styles.chipLoader} />
            </>
         ) : (
            <>
               {livestream?.language?.code ? (
                  <WhiteTagChip
                     icon={<Globe />}
                     variant="filled"
                     tooltipText={`This ${
                        isPast ? "recording" : "live stream"
                     } is in ${livestream?.language.name}`}
                     label={livestream?.language.code.toUpperCase()}
                     sx={styles.chip}
                  />
               ) : null}
               {livestream?.businessFunctionsTagIds
                  ?.slice(0, 1)
                  ?.map((tagId) => (
                     <WhiteTagChip
                        key={tagId}
                        variant="filled"
                        sx={{
                           maxWidth:
                              livestream?.businessFunctionsTagIds.length > 2
                                 ? "50%"
                                 : "80%",
                           ...styles.chip,
                        }}
                        label={TagValuesLookup[tagId]}
                     />
                  ))}
               {livestream?.businessFunctionsTagIds?.length > 2 ? (
                  <WhiteTagChip
                     variant="filled"
                     sx={styles.chip}
                     label={`+ ${
                        livestream?.businessFunctionsTagIds.length - 1
                     }`}
                     tooltipText={livestream?.businessFunctionsTagIds
                        .slice(1)
                        .map((tagId) => TagValuesLookup[tagId])
                        .join(", ")}
                  />
               ) : null}
            </>
         )}
      </Stack>
   )
}

export default EventPreviewCardAboutLabels
