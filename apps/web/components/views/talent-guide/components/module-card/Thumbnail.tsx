import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
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
      height: "100%",
      aspectRatio: "533/947",
      maxHeight: "947px",
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
   overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "black",
      pointerEvents: "none",
   },
   image: {
      objectFit: "cover",
   },
})

type Props = {
   thumbnailUrl: string
   moduleId: string
   expanded?: boolean
   onClose?: () => void
}

export const Thumbnail = ({
   thumbnailUrl = "/levels/placeholder.jpeg",
   moduleId,
   expanded,
   onClose,
}: Props) => {
   const { hasFinishedExpanding, canAnimate: canExpand } =
      useModuleCardContext()
   const isMobile = useIsMobile()

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
               className="thumbnail-image"
               src={thumbnailUrl}
               alt="Levels Module Thumbnail"
               fill
               priority
               quality={100}
               style={styles.image}
               sizes="(max-width: 768px) 100vw, 50vw"
            />
            <Overlay />
            <FramerBox
               sx={styles.mediaContainer}
               initial={{ opacity: 0 }}
               animate={{ opacity: hasFinishedExpanding ? 1 : 0 }}
               transition={{ duration: 0.5 }}
            >
               <ModulePreview onClose={onClose} />
            </FramerBox>
         </FramerBox>
      )
   }

   return (
      <FramerBox
         id="thumbnail"
         layoutId={canExpand ? `thumbnail-${moduleId}` : undefined}
         sx={styles.thumbnail}
      >
         <Box
            component={Image}
            className="thumbnail-image"
            src={thumbnailUrl}
            alt="Levels Module Thumbnail"
            fill
            priority
            style={styles.image}
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
         />
         <Overlay opacity={0.2} />
      </FramerBox>
   )
}

type OverlayProps = {
   opacity?: number
}

const Overlay = ({ opacity = 0.25 }: OverlayProps) => {
   return (
      <Box
         id="overlay"
         sx={[
            styles.overlay,
            {
               opacity,
            },
         ]}
      />
   )
}
