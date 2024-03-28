import { UpdateCreatorData } from "@careerfairy/shared-lib/groups/creators"
import { sxStyles } from "@careerfairy/shared-ui"
import { LinkedIn } from "@mui/icons-material"
import { Box, Button, Divider, Link, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import CollapsibleText from "components/views/common/inputs/CollapsibleText"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { FC } from "react"
import MoreMenuWithEditAndRemoveOptions from "../questions/components/MoreMenu"

const styles = sxStyles({
   alertBorder: {
      borderColor: "#FE9B0E",
   },
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
   descriptionPlaceholder: {
      color: "neutral.500",
      fontStyle: "italic",
      alignItems: "center",
      alignContent: "center",
      justifyContent: "space-between",
      textAlign: {
         xs: "center",
         md: "initial",
      },
      flexDirection: {
         xs: "column",
         md: "row",
      },
      gap: {
         xs: 3,
         md: "initial",
      },
   },
   moreMenu: {
      position: "absolute",
      zIndex: 1,
      top: 0,
      right: 0,
      marginTop: 3,
      marginRight: 3,
   },
   speakerInfo: {
      color: "neutral.400",
      fontSize: "16px",
      lineHeight: "27px",
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

   const speakerHasStory = Boolean(speaker.story)

   return (
      <Box sx={[styles.wrapper, !speaker.email && styles.alertBorder]}>
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
                     avatarUrl: speaker.avatarUrl,
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
                     lineHeight="26px"
                     textAlign={isMobile ? "center" : null}
                  >
                     {`${speaker.firstName} ${speaker.lastName}`}
                  </Typography>
                  <Stack
                     direction="column"
                     textAlign={isMobile ? "center" : null}
                  >
                     <Stack direction="row" gap="16px" alignItems="center">
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
                     {speaker.email ? (
                        <Typography
                           fontSize="16px"
                           color="neutral.400"
                           lineHeight="27px"
                        >
                           {speaker.email}
                        </Typography>
                     ) : (
                        <Typography
                           fontSize="16px"
                           color="#FE9B0E"
                           lineHeight="27px"
                           fontWeight={500}
                        >
                           Missing email address. Please edit this speaker’s
                           details to add it.
                        </Typography>
                     )}
                  </Stack>
               </Stack>
            </Stack>
            {speakerHasStory ? (
               <CollapsibleText
                  text={speaker.story}
                  textStyle={styles.description}
                  collapsedSize={80}
               />
            ) : (
               <Stack sx={styles.descriptionPlaceholder}>
                  <Stack>
                     <Typography>
                        This is your spotlight for our talent community.
                     </Typography>
                     <Typography>
                        Share your experiences and connect with your audience by
                        adding your personal story.
                     </Typography>
                  </Stack>
                  <Button
                     variant="outlined"
                     color="secondary"
                     onClick={handleEdit}
                  >
                     Add personal story
                  </Button>
               </Stack>
            )}
         </Stack>
      </Box>
   )
}

export default SpeakersCard
