import {
   forwardRef,
   HTMLAttributes,
   memo,
   useCallback,
   useEffect,
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

// @dnd-kit requires string 'id' on sortable elements
export interface SortablePhoto extends Photo {
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
   draggable?: boolean
}

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
         draggable,
      } = props
      const { alt, style, src, title, sizes, className, onClick } = imageProps

      const shouldShowOverlay = isLast && numberOfAdditionalPhotos
      const showGrabCursor = !shouldShowOverlay && draggable
      return (
         <div style={wrapperStyle}>
            <div
               ref={ref}
               style={{
                  width: "100%",
                  padding: style.padding,
                  marginBottom: style.marginBottom,
                  position: "relative",
                  height: "100%",
                  display: "block",
                  cursor: showGrabCursor ? "grab" : "auto",
               }}
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
                  src={src}
                  alt={alt}
                  title={title}
                  sizes={sizes}
                  className={className}
                  onClick={onClick}
               />
               {shouldShowOverlay ? (
                  <Box
                     sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        inset: 0,
                     }}
                  >
                     <Typography variant="h2" fontWeight={"600"} color="white">
                        +{numberOfAdditionalPhotos}
                     </Typography>
                  </Box>
               ) : null}
            </div>
         </div>
      )
   })
)
PhotoFrame.displayName = "PhotoFrame"

const SortablePhotoFrame = (
   props: SortablePhotoProps & {
      activeIndex?: number
      isLast?: boolean
      numberOfAdditionalPhotos?: number
      draggable?: boolean
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
   draggable?: boolean
}

const initialPhotos: SortablePhoto[] = []
const PhotoSortExample = ({
   maxPhotos = 10,
   photos = initialPhotos,
   draggable,
}: Props) => {
   const [localPhotos, setLocalPhotos] = useState<SortablePhoto[]>(
      photos.slice(0, maxPhotos)
   )

   useEffect(() => {
      // set the local photos to the photos passed in and limit to maxPhotos
      setLocalPhotos(photos.slice(0, maxPhotos))
   }, [photos, maxPhotos])

   const numberOfAdditionalPhotos =
      photos.length - maxPhotos > 0 ? photos.length - maxPhotos : 0

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

   const handleDragStart = useCallback(
      ({ active }: DragStartEvent) => setActiveId(active.id),
      []
   )

   const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
         setLocalPhotos((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id)
            const newIndex = items.findIndex((item) => item.id === over.id)

            return arrayMove(items, oldIndex, newIndex)
         })
      }
   }, [])

   const renderPhoto = useCallback(
      (props: SortablePhotoProps) => {
         // capture rendered photos for future use in DragOverlay
         renderedPhotos.current[props.photo.id] = props
         return (
            <SortablePhotoFrame
               isLast={
                  props.photo.id === localPhotos[localPhotos.length - 1].id
               }
               draggable={draggable}
               numberOfAdditionalPhotos={numberOfAdditionalPhotos}
               activeIndex={activeIndex}
               {...props}
            />
         )
      },
      [activeIndex, draggable, localPhotos, numberOfAdditionalPhotos]
   )

   return draggable ? (
      <DndContext
         sensors={sensors}
         collisionDetection={closestCenter}
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
      >
         <SortableContext items={localPhotos}>
            <Box>
               <PhotoAlbum
                  photos={localPhotos}
                  layout="rows"
                  padding={1}
                  renderPhoto={renderPhoto}
               />
            </Box>
         </SortableContext>
         <DragOverlay>
            {activeId ? (
               <PhotoFrame overlay {...renderedPhotos.current[activeId]} />
            ) : null}
         </DragOverlay>
      </DndContext>
   ) : (
      <Box>
         <PhotoAlbum
            photos={localPhotos}
            layout="rows"
            padding={1}
            renderPhoto={renderPhoto}
         />
      </Box>
   )
}

export default PhotoSortExample
