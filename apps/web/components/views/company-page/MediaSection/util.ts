import { SortablePhoto } from "./PhotosGallery"
import { GroupPhoto } from "@careerfairy/shared-lib/groups"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { imagePlaceholder } from "../../../../constants/images"

export const mapGroupPhotos = (photos: GroupPhoto[]): SortablePhoto[] => {
   return photos.map((photo) => ({
      id: photo.id,
      src: photo.url,
      alt: photo.id,
      height: 116,
      width: 116,
      title: "Photo",
   }))
}
export const mapPlaceholderPhotos = (count: number): SortablePhoto[] => {
   return Array.from({ length: count }, (_, i) => i).map((i) => ({
      id: `placeholder-${i}`,
      src: getResizedUrl(imagePlaceholder, "xs"),
      alt: "placeholder",
      title: "placeholder",
      width: 116,
      height: 116,
      key: `placeholder-${i}`,
   }))
}
