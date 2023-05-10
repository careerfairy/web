import { FC } from "react"
import BaseDialogView, { HeroContent } from "../BaseDialogView"
import { useLiveStreamDialog } from "../LivestreamDialog"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../types/commonTypes"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Image from "next/image"
import {
   InPersonEventBadge,
   LimitedRegistrationsBadge,
} from "../../common/NextLivestreams/GroupStreams/groupStreamCard/badges"
import WhiteTagChip from "../../common/chips/TagChip"
import LanguageIcon from "@mui/icons-material/Language"
import { useFirestoreCollection } from "../../../custom-hook/utils/useFirestoreCollection"
import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../data/firebase/FirebaseInstance"
import { Interest } from "../../../../types/interests"
import { alpha } from "@mui/material/styles"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

const styles = sxStyles({
   root: {},
   eventTitle: {
      fontWeight: 600,
      textAlign: "center",
      maxWidth: 655,
   },
   logoWrapper: {
      p: 1,
      background: "white",
      borderRadius: 4,
      display: "flex",
   },
   companyNameWrapper: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
   },
   tagsWrapper: {
      display: "flex",
      flexWrap: "wrap",
      "& .MuiChip-root": {
         margin: {
            xs: 0.5,
            md: 1,
         },
         marginLeft: 0,
      },
      justifyContent: "center",
   },
   chip: {
      backgroundColor: (theme) => alpha(theme.palette.common.white, 0.2),
      borderRadius: 3.5,
      borderWidth: 1,
      height: { sm: "2.78rem" },
      margin: { sm: "0.6em" },
      "& svg": {
         fontSize: { sm: "2.25rem" },
      },
      "& span": {
         fontSize: { sm: "1.7rem" },
      },
   },
})

const LivestreamDetailsView: FC = () => {
   const { livestream, livestreamPresenter } = useLiveStreamDialog()

   if (!livestream) return <LivestreamDetailsViewSkeleton />

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
            >
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <Stack spacing={1.5} direction="row">
                     <Box sx={styles.logoWrapper}>
                        <Image
                           src={getResizedUrl(livestream.companyLogoUrl, "lg")}
                           width={50}
                           height={50}
                           objectFit={"contain"}
                           alt={livestream.company}
                        />
                     </Box>
                     <Box sx={styles.companyNameWrapper}>
                        <Typography fontWeight={300} variant={"body1"}>
                           Hosted by
                        </Typography>
                        <Typography fontWeight={600} variant={"h5"}>
                           {livestream.company}
                        </Typography>
                     </Box>
                  </Stack>
                  <Typography
                     variant={"h2"}
                     component="h1"
                     sx={styles.eventTitle}
                  >
                     {livestream.title}
                  </Typography>
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
               </Stack>
            </HeroContent>
         }
      />
   )
}

type LivestreamTagsContainerProps = {
   presenter: LivestreamPresenter
}
const LivestreamTagsContainer: FC<LivestreamTagsContainerProps> = ({
   presenter,
}) => {
   const { data: interests, status } = useInterestsByIds(presenter.interestsIds)

   const loadingInterests = status === "loading"

   return (
      <Box sx={styles.tagsWrapper}>
         {presenter.isFaceToFace ? (
            <InPersonEventBadge sx={styles.chip} white />
         ) : null}
         {presenter.maxRegistrants ? (
            <LimitedRegistrationsBadge
               sx={styles.chip}
               white
               numberOfSpotsRemaining={presenter.getNumberOfSpotsRemaining()}
            />
         ) : null}
         {presenter.language ? (
            <WhiteTagChip
               sx={styles.chip}
               icon={<LanguageIcon />}
               variant={"outlined"}
               tooltipText={`This event is in ${presenter.language.name}`}
               label={presenter.language.code.toUpperCase()}
            />
         ) : null}
         {loadingInterests ? (
            <>
               <Skeleton
                  sx={styles.chip}
                  variant={"rectangular"}
                  width={100}
                  height={40}
               />
               <Skeleton
                  sx={styles.chip}
                  variant={"rectangular"}
                  width={100}
                  height={40}
               />
            </>
         ) : (
            <>
               {interests?.map((interest) => (
                  <WhiteTagChip
                     key={interest.id}
                     sx={styles.chip}
                     variant={"outlined"}
                     label={interest.name}
                  />
               ))}
            </>
         )}
      </Box>
   )
}

const useInterestsByIds = (ids: string[]) => {
   return useFirestoreCollection<Interest>(
      query(
         collection(FirestoreInstance, "interests"),
         where("__name__", "in", ids?.length ? ids : ["-"])
      ),
      {
         suspense: false,
      }
   )
}

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Typography variant={"h1"} sx={styles.eventTitle}>
                  <Skeleton width={"100%"} />
                  <Skeleton width={"50%"} />
               </Typography>
            </HeroContent>
         }
      />
   )
}

export default LivestreamDetailsView
