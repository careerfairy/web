import { FC, forwardRef, HTMLAttributes, memo } from "react"
import { Box, Typography } from "@mui/material"
import clsx from "clsx"
import Image from "next/legacy/image"
import IconButton from "@mui/material/IconButton"
import { Trash2 as DeleteIcon } from "react-feather"
import { SortablePhotoProps } from "../../company-page/MediaSection/PhotosGallery"
import { useSortable } from "@dnd-kit/sortable"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
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
   innerWrapperStyles: {
      width: "100%",
      position: "relative",
      height: "100%",
      display: "block",
      borderRadius: 2,
      overflow: "hidden",
   },
   cursorGrab: {
      cursor: "grab",
   },
   cursorGrabbing: {
      cursor: "grabbing",
      position: "absolute",
   },
   overlay: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bgcolor: "rgba(0, 0, 0, 0.5)",
      inset: 0,
      zIndex: 1,
      cursor: "pointer",
   },
})

type PhotoFrameProps = SortablePhotoProps & {
   overlay?: boolean
   active?: boolean
   insertPosition?: "before" | "after"
   attributes?: Partial<HTMLAttributes<HTMLDivElement>>
   listeners?: Partial<HTMLAttributes<HTMLDivElement>>
}

export const PhotoFrame = memo(
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
         onAdditionalImageCountOverlayClick,
      } = props
      const { alt, src, title, sizes, className, onClick } = imageProps

      const shouldShowOverlay = isLast && numberOfAdditionalPhotos
      const showGrabCursor = !shouldShowOverlay && editable
      const showDeleteButton = editable && !shouldShowOverlay

      return (
         <div
            onClick={
               shouldShowOverlay
                  ? onAdditionalImageCountOverlayClick
                  : undefined
            }
            style={wrapperStyle}
         >
            <Box
               ref={ref}
               sx={[
                  styles.innerWrapperStyles,
                  showGrabCursor && styles.cursorGrab,
                  overlay && styles.cursorGrabbing,
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

export const SortablePhotoFrame = (
   props: SortablePhotoProps & {
      activeIndex?: number
   }
) => {
   const { photo, activeIndex } = props
   const { attributes, listeners, isDragging, index, over, setNodeRef } =
      useSortable({ id: photo.id })

   return (
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
   )
}

type PlaceholderPhotoProps = SortablePhotoProps
export const PlaceholderPhoto: FC<PlaceholderPhotoProps> = ({
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
         <Box width={"37%"} position={"relative"} height={"45%"}>
            <Image
               layout={"fill"}
               objectFit={"contain"}
               src={photo.src}
               alt="placeholder"
            />
         </Box>
      </Box>
   </Box>
)

type ExtraImagesOverlayProps = {
   numberOfAdditionalPhotos: number
}
const ExtraImagesOverlay = ({
   numberOfAdditionalPhotos,
}: ExtraImagesOverlayProps) => {
   return (
      <Box sx={styles.overlay}>
         <Typography variant="h2" fontWeight={"600"} color="white">
            +{numberOfAdditionalPhotos}
         </Typography>
      </Box>
   )
}
