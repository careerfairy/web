import { FC } from "react"
import Lightbox, { SlideImage } from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import "yet-another-react-lightbox/styles.css"

type Props = {
   photos: SlideImage[]
   photoIndex: number // index of the photo to show

   close: () => void // callback to close the lightbox (set photoIndex to -1)
}
const ImagePreview: FC<Props> = ({ photos, photoIndex, close }) => {
   const open = photoIndex >= 0
   return (
      <Lightbox
         slides={photos}
         open={open}
         index={photoIndex}
         close={close}
         // enable optional lightbox plugins
         plugins={[Fullscreen]}
         render={{
            buttonPrev: photos?.length <= 1 ? () => null : undefined,
            buttonNext: photos?.length <= 1 ? () => null : undefined,
         }}
      />
   )
}

export default ImagePreview
