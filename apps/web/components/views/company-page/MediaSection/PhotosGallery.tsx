import {
   FC,
   forwardRef,
   HTMLAttributes,
   memo,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { Photo, PhotoAlbum, RenderPhotoProps } from "react-photo-album"
import clsx from "clsx"
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
   useSortable,
} from "@dnd-kit/sortable"
import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { sxStyles } from "../../../../types/commonTypes"
import { Trash2 as DeleteIcon } from "react-feather"
import IconButton from "@mui/material/IconButton"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { imagePlaceholder } from "../../../../constants/images"
import ImagePreview from "../../common/ImagePreview"

export interface SortablePhoto extends Photo {
   // @dnd-kit requires string 'id' on sortable elements
   id: string
}

type SortablePhotoProps = RenderPhotoProps<SortablePhoto>

type PhotoFrameProps = SortablePhotoProps & {
   overlay?: boolean
   active?: boolean
   insertPosition?: "before" | "after"
   attributes?: Partial<HTMLAttributes<HTMLDivElement>>
   listeners?: Partial<HTMLAttributes<HTMLDivElement>>
   isLast?: boolean
   numberOfAdditionalPhotos?: number
   editable?: boolean
   handleDeletePhoto?: (photoId: string) => void
}

const styles = sxStyles({
   overlay: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bgcolor: "rgba(0, 0, 0, 0.5)",
      inset: 0,
   },
   deleteButton: {
      position: "absolute",
      top: 3,
      right: 3,
      bgcolor: "rgba(0, 0, 0, 0.5)",
      "&:hover": {
         bgcolor: "rgba(0, 0, 0, 0.7)",
      },
   },
   placeholderWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      border: "dashed",
      borderRadius: 2,
      borderColor: "grey.400",
      borderWidth: 2,
   },
})

const PhotoFrame = memo(
   forwardRef<HTMLDivElement, PhotoFrameProps>((props, ref) => {
      const {
         imageProps,
         overlay,
         active,
         insertPosition,
         attributes,
         listeners,
         isLast,
         numberOfAdditionalPhotos,
         wrapperStyle,
         editable,
         handleDeletePhoto,
         photo,
      } = props
      const { alt, src, title, sizes, className, onClick } = imageProps
      const shouldShowOverlay = isLast && numberOfAdditionalPhotos
      const showGrabCursor = !shouldShowOverlay && editable
      const showDeleteButton = editable && !shouldShowOverlay
      return (
         <div style={wrapperStyle}>
            <Box
               ref={ref}
               sx={[
                  {
                     width: "100%",
                     position: "relative",
                     height: "100%",
                     display: "block",
                     borderRadius: 2,
                     overflow: "hidden",
                  },
                  showGrabCursor && {
                     cursor: "grab",
                  },
                  overlay && {
                     position: "absolute",
                     cursor: "grabbing",
                  },
               ]}
               className={clsx("photo-frame", {
                  overlay: overlay,
                  active: active,
                  insertBefore: insertPosition === "before",
                  insertAfter: insertPosition === "after",
               })}
               {...attributes}
               {...listeners}
            >
               <Image
                  layout="fill"
                  objectFit="cover"
                  src={src}
                  alt={alt}
                  title={title}
                  sizes={sizes}
                  className={className}
                  onClick={onClick}
               />
               {showDeleteButton ? (
                  <IconButton
                     onClick={() => {
                        handleDeletePhoto?.(photo?.id)
                     }}
                     color={"info"}
                     sx={styles.deleteButton}
                  >
                     <DeleteIcon />
                  </IconButton>
               ) : null}
               {shouldShowOverlay ? (
                  <ExtraImagesOverlay
                     numberOfAdditionalPhotos={numberOfAdditionalPhotos}
                  />
               ) : null}
            </Box>
         </div>
      )
   })
)

type ExtraImagesOverlayProps = {
   numberOfAdditionalPhotos: number
   onClick?: () => void
}
const ExtraImagesOverlay = ({
   numberOfAdditionalPhotos,
   onClick,
}: ExtraImagesOverlayProps) => {
   return (
      <Box
         onClick={(event) =>
            onClick
               ? () => {
                    event.stopPropagation()
                    onClick()
                 }
               : undefined
         }
         sx={[
            styles.overlay,
            onClick && {
               cursor: "pointer",
            },
         ]}
      >
         <Typography variant="h2" fontWeight={"600"} color="white">
            +{numberOfAdditionalPhotos}
         </Typography>
      </Box>
   )
}
PhotoFrame.displayName = "PhotoFrame"

const SortablePhotoFrame = (
   props: SortablePhotoProps & {
      activeIndex?: number
      isLast?: boolean
      numberOfAdditionalPhotos?: number
      editable?: boolean
      handleDeletePhoto?: (photoId: string) => void
   }
) => {
   const { photo, activeIndex } = props
   const { attributes, listeners, isDragging, index, over, setNodeRef } =
      useSortable({ id: photo.id })

   return (
      <>
         <PhotoFrame
            ref={setNodeRef}
            active={isDragging}
            insertPosition={
               activeIndex !== undefined && over?.id === photo.id && !isDragging
                  ? index > activeIndex
                     ? "after"
                     : "before"
                  : undefined
            }
            aria-label="sortable image"
            attributes={attributes}
            listeners={listeners}
            {...props}
         />
      </>
   )
}

type Props = {
   photos: SortablePhoto[]
   maxPhotos?: number
   editable?: boolean
   /**
    * Callback to be called when the user has finished sorting with the new order of photos
    * */
   onPhotosChanged?: (newlyPhotos: SortablePhoto[]) => void | Promise<void>
   onAdditionalPhotosOverlayClick?: () => void
}

const initialPhotos: SortablePhoto[] = []
const PhotosGallery = ({
   maxPhotos,
   photos = initialPhotos,
   editable,
   onPhotosChanged,
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

      // If there are less photos than maxPhotos, add empty photos to fill the rest of the gallery
      if (maxPhotos && localPhotos.length < maxPhotos) {
         const emptyPhotos = Array.from(
            { length: maxPhotos - localPhotos.length },
            (_, i) => i
         ).map((i) => ({
            id: `placeholder-${i}`,
            src: getResizedUrl(imagePlaceholder, "xs"),
            alt: "placeholder",
            title: "placeholder",
            width: 116,
            height: 116,
            key: `placeholder-${i}`,
         }))
         return [...slicedPhotos, ...emptyPhotos]
      }

      return slicedPhotos
   }, [localPhotos, maxPhotos])

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
      ]
   )

   return editable ? (
      <>
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            <SortableContext items={photosToShow}>
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
   ) : (
      <Box>
         <PhotoAlbum
            photos={photosToShow}
            layout="rows"
            padding={5}
            renderPhoto={renderPhoto}
         />
      </Box>
   )
}

type PlaceholderPhotoProps = SortablePhotoProps
const PlaceholderPhoto: FC<PlaceholderPhotoProps> = ({
   photo,
   wrapperStyle,
}) => (
   <Box
      style={{
         ...wrapperStyle,
         cursor: "default",
      }}
   >
      <Box sx={styles.placeholderWrapper}>
         <Image
            width={100}
            objectFit={"contain"}
            height={100}
            src={photo.src}
            alt="placeholder"
         />
      </Box>
   </Box>
)
export default PhotosGallery
