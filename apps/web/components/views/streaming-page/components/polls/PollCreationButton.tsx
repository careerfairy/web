import { Button } from "@mui/material"

type PollCreationButtonProps = {
   onClick: () => void
}

export const PollCreationButton = ({ onClick }: PollCreationButtonProps) => {
   return (
      <Button color="primary" variant="contained" fullWidth onClick={onClick}>
         Create new poll
      </Button>
   )
}
