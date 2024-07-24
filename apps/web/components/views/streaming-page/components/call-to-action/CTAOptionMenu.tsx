import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedOptions from "components/views/common/inputs/BrandedOptions"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Edit, Trash2 } from "react-feather"

type Props = {
   cta: LivestreamCTA
   onClickEdit: () => void
   onClickDelete: (ctaId) => void
}

export const CTAOptionsMenu = ({ cta, onClickEdit, onClickDelete }: Props) => {
   const { anchorEl, handleClick, handleClose } = useMenuState()

   const streamIsMobile = useStreamIsMobile()

   const open = Boolean(anchorEl)
   const options: MenuOption[] = [
      {
         label: "Edit call to action",
         icon: <Edit />,
         handleClick: onClickEdit,
      },
      {
         label: "Delete call to action",
         icon: <Trash2 />,
         color: "error.main",
         handleClick: () => onClickDelete(cta.id),
      },
   ]

   return (
      <Fragment>
         <BrandedOptions onClick={handleClick} />
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
