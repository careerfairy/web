import { IconButton } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Trash2 as DeleteIcon, MoreVertical, RefreshCw } from "react-feather"
import { sxStyles } from "types/commonTypes"
import {
   LivestreamQuestion,
   checkIsQuestionAuthor,
} from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"

const styles = sxStyles({
   delete: {
      color: "error.main",
   },
   optionsIcon: {
      p: 0.2,
      m: -0.2,
      "& svg": {
         width: 24,
         height: 24,
         color: "neutral.700",
      },
   },
})

type Props = {
   isHost: boolean
   agoraUid: string
   question: LivestreamQuestion
   onClickDelete: (questionId: string) => void
   onClickReset: (questionId: string) => void
}

export const QuestionOptionsMenu = ({
   isHost,
   agoraUid,
   question,
   onClickDelete,
   onClickReset,
}: Props) => {
   const { anchorEl, handleClick, handleClose } = useMenuState()
   const { authenticatedUser } = useAuth()

   const streamIsMobile = useStreamIsMobile()

   const open = Boolean(anchorEl)

   const getOptions = () => {
      const options: MenuOption[] = []

      if (isHost && question.type !== "new") {
         options.push({
            label: "Reset state",
            icon: <RefreshCw />,
            handleClick: () => onClickReset(question.id),
         })
      }

      if (
         isHost ||
         checkIsQuestionAuthor(question, {
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            agoraUid,
         })
      ) {
         options.push({
            label: "Delete question",
            icon: <DeleteIcon />,
            handleClick: () => onClickDelete(question.id),
            menuItemSxProps: [styles.delete],
         })
      }

      return options
   }

   const options = getOptions()

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
         />
      </Fragment>
   )
}
