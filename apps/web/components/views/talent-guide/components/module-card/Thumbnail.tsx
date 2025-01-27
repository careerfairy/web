import useIsMobile from "components/custom-hook/useIsMobile"
import { ONBOARDING_VIDEO_URL_DESKTOP } from "components/util/constants"
import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"
import { useModuleCardContext } from "./ModuleCard"
import { ModulePreview } from "./ModulePreview"

const styles = sxStyles({
   thumbnail: {
      position: "relative",
      width: 97,
      height: "inherit",
      borderRadius: "9px",
      overflow: "hidden",
      flexShrink: 0,
   },
   expandedThumbnailDesktop: {
      position: "relative",
      width: "100%",
      aspectRatio: "533/947",
      maxWidth: "533px",
      margin: "0 auto",
      borderRadius: "12px",
      overflow: "hidden",
   },
   expandedThumbnailMobile: {
      width: "100%",
      height: "100%",
   },
   mediaContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
})

type Props = {
   thumbnailUrl: string
   moduleId: string
   expanded?: boolean
}

export const Thumbnail = ({
   thumbnailUrl = "/levels/placeholder.jpeg",
   moduleId,
   expanded,
}: Props) => {
   const { hasFinishedExpanding } = useModuleCardContext()
   const isMobile = useIsMobile()
   const router = useRouter()

   if (expanded) {
      return (
         <FramerBox
            id="expanded-thumbnail"
            layoutId={`thumbnail-${moduleId}`}
            sx={[
               isMobile
                  ? styles.expandedThumbnailMobile
                  : styles.expandedThumbnailDesktop,
            ]}
         >
            <Image
               src={thumbnailUrl}
               alt="Levels Module Thumbnail"
               fill
               priority
               quality={100}
               style={{ objectFit: "cover" }}
               sizes="90vw"
            />
            <FramerBox
               sx={styles.mediaContainer}
               initial={{ opacity: 0 }}
               animate={{ opacity: hasFinishedExpanding ? 1 : 0 }}
               transition={{ duration: 0.5 }}
            >
               <ModulePreview
                  thumbnailUrl={thumbnailUrl}
                  videoUrl={ONBOARDING_VIDEO_URL_DESKTOP}
                  onClose={() => {
                     const newQuery = { ...router.query }
                     delete newQuery.moduleId
                     router.push(
                        "",
                        {
                           query: newQuery,
                        },
                        { shallow: true }
                     )
                  }}
               />
            </FramerBox>
         </FramerBox>
      )
   }

   return (
      <FramerBox
         id="thumbnail"
         layoutId={`thumbnail-${moduleId}`}
         sx={styles.thumbnail}
      >
         <Image
            src={thumbnailUrl}
            alt="Levels Module Thumbnail"
            fill
            priority
            quality={100}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
         />
      </FramerBox>
   )
}
