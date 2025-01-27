import FramerBox from "components/views/common/FramerBox"
import Image from "next/image"
// import { sxStyles } from "types/commonTypes"

// const styles = sxStyles({
//    root: {
//       position: "relative",
//       width: 97,
//       borderRadius: "9px",
//       overflow: "hidden",
//       flexShrink: 0,
//       aspectRatio: "1.78",
//    },
//    expanded: {
//       width: "100%",
//       height: "100%",
//       borderRadius: 0,
//    },
// })

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
   return (
      <FramerBox
         id="thumbnail"
         layoutId={`thumbnail-${moduleId}`}
         sx={{
            position: "relative",
            width: expanded ? "auto" : 97,
            height: expanded ? "100%" : undefined,
            borderRadius: expanded ? 0 : "9px",
            overflow: "hidden",
            flexShrink: 0,
            aspectRatio: "533 / 947",
         }}
      >
         <Image
            src={thumbnailUrl}
            alt="Levels Module Thumbnail"
            fill
            priority
            quality={100}
            style={{ objectFit: "cover" }}
            sizes={expanded ? "90vw" : "(max-width: 768px) 100vw, 50vw"}
         />
      </FramerBox>
   )
}
