import { FC } from "react"
import { sxStyles } from "@careerfairy/shared-ui"
import { UpdateCreatorData } from "@careerfairy/shared-lib/groups/creators"
import { Box, Divider, Link, Stack, Typography } from "@mui/material"
import CollapsibleText from "components/views/common/inputs/CollapsibleText"
import MoreMenuWithEditAndRemoveOptions from "../questions/components/MoreMenu"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { LinkedIn } from "@mui/icons-material"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   wrapper: {
      p: 3,
      mt: 3,
      border: "1px solid #ECECEC",
      borderRadius: 2,
      position: "relative",
   },
   description: {
      fontSize: "16px",
      color: "neutral.600",
   },
   moreMenu: {
      position: "absolute",
      zIndex: 1,
      top: 0,
      right: 0,
      marginTop: 3,
      marginRight: 3,
   },
})

type SpeakersCardProps = {
   speaker: Partial<UpdateCreatorData>
   handleEdit: () => void
   handleRemove: () => void
}

const SpeakersCard: FC<SpeakersCardProps> = ({
   speaker,
   handleEdit,
   handleRemove,
}) => {
   const isMobile = useIsMobile()

   return (
      <Box sx={styles.wrapper}>
         <Box sx={styles.moreMenu}>
            <MoreMenuWithEditAndRemoveOptions
               labels={["Edit speaker's details", "Remove speaker"]}
               handleEdit={handleEdit}
               handleRemove={handleRemove}
            />
         </Box>
         <Stack direction="column" gap="16px">
            <Stack
               direction={isMobile ? "column" : "row"}
               alignItems="center"
               gap="10px"
            >
               <CreatorAvatar
                  creator={{
                     firstName: speaker.firstName,
                     lastName: speaker.lastName,
                     avatarUrl: speaker.avatar,
                  }}
                  size={104}
               />
               <Stack
                  direction="column"
                  gap="12px"
                  marginTop={1}
                  alignItems={isMobile ? "center" : null}
               >
                  <Typography
                     fontSize="24px"
                     fontWeight="600"
                     lineHeight="20px"
                  >
                     {`${speaker.firstName} ${speaker.lastName}`}
                  </Typography>
                  <Stack direction="column">
                     <Stack
                        direction="row"
                        gap="16px"
                        alignItems="center"
                        justifyContent={isMobile ? "center" : null}
                     >
                        <Typography
                           fontSize="16px"
                           color="neutral.400"
                           lineHeight="27px"
                        >
                           {speaker.position}
                        </Typography>
                        <Divider
                           orientation="vertical"
                           sx={{ height: "20px" }}
                        />
                        {speaker.linkedInUrl ? (
                           <Link href={speaker.linkedInUrl} target="_blank">
                              <LinkedIn htmlColor="#0166c8" />
                           </Link>
                        ) : (
                           <LinkedIn htmlColor="#e5e5e5" />
                        )}
                     </Stack>
                     <Typography
                        fontSize="16px"
                        color="neutral.400"
                        lineHeight="27px"
                     >
                        {speaker.email}
                     </Typography>
                  </Stack>
               </Stack>
            </Stack>
            <CollapsibleText
               text={
                  speaker.story ||
                  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec odio ante. Ut eu tellus a massa bibendum finibus eget at sapien. Vestibulum fringilla a magna vel facilisis. Ut vehicula, lectus non interdum condimentum, nulla sem egestas nisl, a aliquet sapien magna id metus. Donec justo mauris, ullamcorper vel porta ac, fringilla a libero. Maecenas mauris massa, varius vitae rhoncus id, iaculis vel mauris. Duis faucibus sapien a ornare sodales. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus non felis venenatis, pretium lorem finibus, laoreet turpis. Nulla facilisi. Duis eu eros vel odio cursus facilisis. Mauris et turpis nibh. Ut eget nisi eu leo porttitor venenatis. Vestibulum tempus, mi a dapibus egestas, lorem risus lacinia risus, nec pharetra augue enim vel eros. Vestibulum ac velit est. Mauris eget maximus velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In iaculis vehicula ipsum vel auctor. Quisque tellus eros, dictum vitae rutrum a, consequat ut leo. Pellentesque lobortis fringilla metus, sed placerat quam rutrum eu. Cras quis viverra tellus, ac lobortis sapien. Praesent faucibus, augue sit amet blandit gravida, ipsum turpis malesuada felis, at porttitor leo sapien vitae enim. Sed vitae tincidunt dolor. Aenean et egestas arcu, vel commodo elit. Nullam vel ex facilisis, consectetur mauris imperdiet, molestie erat.`
               }
               textStyle={styles.description}
               collapsedSize={80}
            />
         </Stack>
      </Box>
   )
}

export default SpeakersCard
