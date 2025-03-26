import { DialogTitle } from "@mui/material"

import { Dialog } from "@mui/material"

type Props = {
   open: boolean
   onClose: () => void
}

export const BoostedCompanyDialog = ({ open, onClose }: Props) => {
   return (
      <Dialog open={open} onClose={onClose}>
         <DialogTitle>Boosted Company</DialogTitle>
      </Dialog>
   )
}
