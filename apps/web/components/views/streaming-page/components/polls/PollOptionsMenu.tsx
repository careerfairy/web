import { IconButton } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useDeleteLivestreamPoll } from "components/custom-hook/streaming/useDeleteLivestreamPoll"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Trash2 as DeleteIcon, Edit, MoreVertical } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"

const styles = sxStyles({
   delete: {
      color: "error.main",
   },
   optionsIcon: {
      "& svg": {
         width: 21,
         height: 21,
         color: (theme) => theme.brand.black[600],
      },
   },
})

type Props = {
   poll: LivestreamPoll
   onClickEdit: () => void
}

export const PollOptionsMenu = ({ poll, onClickEdit }: Props) => {
   const { anchorEl, handleClick, handleClose } = useMenuState()

   const streamIsMobile = useStreamIsMobile()

   const { livestreamId, streamerAuthToken } = useStreamingContext()

   const { trigger: deleteChatEntry, isMutating } = useDeleteLivestreamPoll(
      livestreamId,
      poll.id,
      streamerAuthToken
   )

   const open = Boolean(anchorEl)

   const options: MenuOption[] = [
      ...(poll.state === "upcoming" // Only newly created polls can be edited
         ? [
              {
                 label: "Edit poll",
                 icon: <Edit />,
                 handleClick: onClickEdit,
              },
           ]
         : []),
      ...(poll.state !== "current" // If a poll is ongoing, we can't delete it
         ? [
              {
                 label: "Delete poll",
                 icon: <DeleteIcon />,
                 handleClick: () => deleteChatEntry(),
                 menuItemSxProps: [styles.delete],
                 loading: isMutating,
              },
           ]
         : []),
   ]

   if (options.length === 0) {
      return null
   }

   return (
      <Fragment>
         <IconButton onClick={handleClick} sx={styles.optionsIcon} size="small">
            <MoreVertical />
         </IconButton>
         <BrandedResponsiveMenu
            options={options}
            open={open}
            handleClose={handleClose}
            anchorEl={anchorEl}
            isMobileOverride={streamIsMobile}
            enableDrawerCancelButton
         />
      </Fragment>
   )
}
