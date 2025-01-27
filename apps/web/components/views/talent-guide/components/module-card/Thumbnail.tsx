import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   thumbnail: {
      position: "relative",
      width: 97,
      height: "inherit",
      borderRadius: "9px",
      overflow: "hidden",
      flexShrink: 0,
   },
   expandedThumbnail: {
      position: "relative",
      width: "100%",
      aspectRatio: "533/947",
      maxWidth: "533px",
      margin: "0 auto",
      borderRadius: "12px",
      overflow: "hidden",
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
   if (expanded) {
      return (
         <FramerBox
            id="expanded-thumbnail"
            layoutId={`thumbnail-${moduleId}`}
            sx={styles.expandedThumbnail}
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
