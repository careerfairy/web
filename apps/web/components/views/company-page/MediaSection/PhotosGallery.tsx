import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Photo, PhotoAlbum, RenderPhotoProps } from "react-photo-album"
import {
   closestCenter,
   DndContext,
   DragEndEvent,
   DragOverlay,
   DragStartEvent,
   KeyboardSensor,
   MouseSensor,
   TouchSensor,
   UniqueIdentifier,
   useSensor,
   useSensors,
} from "@dnd-kit/core"
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Box } from "@mui/material"
import ImagePreview from "../../common/ImagePreview"
import {
   PhotoFrame,
   PlaceholderPhoto,
   SortablePhotoFrame,
} from "../../common/photo-gallery/PhotoFrame"
import { mapPlaceholderPhotos } from "./util"

export interface SortablePhoto extends Photo {
   // @dnd-kit requires string 'id' on sortable elements
   id: string
}

export type SortablePhotoProps = RenderPhotoProps<SortablePhoto> & {
   isLast?: boolean
   numberOfAdditionalPhotos?: number
   editable?: boolean
   handleDeletePhoto?: (photoId: string) => void
   onAdditionalImageCountOverlayClick?: () => void
}

type Props = {
   photos: SortablePhoto[]
   maxPhotos?: number
   editable?: boolean
   /**
    * Callback to be called when the user has finished sorting with the new order of photos
    * */
   onPhotosChanged?: (newlyPhotos: SortablePhoto[]) => void | Promise<void>
   onAdditionalImageCountOverlayClick?: () => void
}

const initialPhotos: SortablePhoto[] = []
const PhotosGallery = ({
   maxPhotos,
   photos = initialPhotos,
   editable,
   onPhotosChanged,
   onAdditionalImageCountOverlayClick,
}: Props) => {
   const [localPhotos, setLocalPhotos] = useState<SortablePhoto[]>(photos)
   const [index, setIndex] = useState(-1)

   useEffect(() => {
      // set the local photos to the photos passed in and limit to maxPhotos
      setLocalPhotos(photos)
   }, [photos, maxPhotos])

   const numberOfAdditionalPhotos =
      maxPhotos && localPhotos.length > maxPhotos
         ? localPhotos.length - maxPhotos
         : 0

   const renderedPhotos = useRef<{ [key: string]: SortablePhotoProps }>({})
   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
   const activeIndex = activeId
      ? localPhotos.findIndex((photo) => photo.id === activeId)
      : undefined

   const sensors = useSensors(
      useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, {
         activationConstraint: { delay: 50, tolerance: 10 },
      }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   )

   const handleDeletePhoto = useCallback(
      (photoId: string) => {
         setLocalPhotos((items) => {
            const newPhotos = items.filter((item) => item.id !== photoId)
            onPhotosChanged?.(newPhotos)
            return newPhotos
         })
      },
      [onPhotosChanged]
   )

   const handleDragStart = useCallback(
      ({ active }: DragStartEvent) => setActiveId(active.id),
      []
   )

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         const { active, over } = event

         if (over && active.id !== over.id) {
            setLocalPhotos((items) => {
               const oldIndex = items.findIndex((item) => item.id === active.id)
               const newIndex = items.findIndex((item) => item.id === over.id)

               const newPhotos = arrayMove(items, oldIndex, newIndex)

               onPhotosChanged?.(newPhotos)

               return newPhotos
            })
         }
      },
      [onPhotosChanged]
   )

   const photosToShow = useMemo(() => {
      const slicedPhotos = maxPhotos
         ? localPhotos.slice(0, maxPhotos)
         : localPhotos

      // If there are less photos than maxPhotos, add placeholders. If not in edit mode, don't add placeholders
      if (maxPhotos && localPhotos.length < maxPhotos && editable) {
         const numberOfPlaceholders = maxPhotos - localPhotos.length
         const emptyPhotos = mapPlaceholderPhotos(numberOfPlaceholders)

         return [...slicedPhotos, ...emptyPhotos]
      }

      return slicedPhotos
   }, [editable, localPhotos, maxPhotos])

   const photosForPreview = useMemo(() => {
      return localPhotos.map((photo) => ({
         src: photo.src,
      }))
   }, [localPhotos])

   const renderPhoto = useCallback(
      (props: SortablePhotoProps) => {
         if (props.photo.id.indexOf("placeholder") > -1) {
            return <PlaceholderPhoto {...props} />
         }
         // capture rendered photos for future use in DragOverlay
         renderedPhotos.current[props.photo.id] = props
         return (
            <SortablePhotoFrame
               isLast={
                  props.photo.id === photosToShow[photosToShow.length - 1].id
               }
               handleDeletePhoto={handleDeletePhoto}
               editable={editable}
               numberOfAdditionalPhotos={numberOfAdditionalPhotos}
               activeIndex={activeIndex}
               onAdditionalImageCountOverlayClick={
                  onAdditionalImageCountOverlayClick
               }
               {...props}
            />
         )
      },
      [
         photosToShow,
         handleDeletePhoto,
         editable,
         numberOfAdditionalPhotos,
         activeIndex,
         onAdditionalImageCountOverlayClick,
      ]
   )

   return (
      <>
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            <SortableContext disabled={!editable} items={photosToShow}>
               <Box>
                  <PhotoAlbum
                     photos={photosToShow}
                     layout="rows"
                     onClick={({ index }) => setIndex(index)}
                     renderPhoto={renderPhoto}
                     padding={5}
                  />
               </Box>
            </SortableContext>
            <DragOverlay>
               {activeId ? (
                  <PhotoFrame overlay {...renderedPhotos.current[activeId]} />
               ) : null}
            </DragOverlay>
         </DndContext>
         <ImagePreview
            photos={photosForPreview}
            photoIndex={index}
            close={() => setIndex(-1)}
         />
      </>
   )
}

export default PhotosGallery
