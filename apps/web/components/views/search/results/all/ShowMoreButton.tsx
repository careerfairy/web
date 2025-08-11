import { LoadingButton } from "@mui/lab"
import { styled } from "@mui/material/styles"
import { ChevronDown } from "react-feather"

interface ShowMoreButtonProps {
   onClick: () => void
   loading: boolean
   disabled?: boolean
}

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
   color: theme.palette.neutral[600],
   borderColor: theme.palette.neutral[200],
   backgroundColor: "transparent",
   "&:hover": {
      borderColor: theme.palette.neutral[300],
      backgroundColor: theme.palette.neutral[50],
   },
}))

export const ShowMoreButton = ({
   onClick,
   loading,
   disabled = false,
}: ShowMoreButtonProps) => {
   return (
      <StyledLoadingButton
         variant="outlined"
         onClick={onClick}
         loading={loading}
         disabled={disabled}
         fullWidth
         endIcon={<ChevronDown />}
      >
         Show more
      </StyledLoadingButton>
   )
}
