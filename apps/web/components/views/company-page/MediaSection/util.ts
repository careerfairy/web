import { SortablePhoto } from "./PhotosGallery"
import { GroupPhoto } from "@careerfairy/shared-lib/groups"

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
