import { Chip, Tooltip } from "@mui/material"
import { ChipProps } from "@mui/material/Chip/Chip"
import { Theme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
import { combineStyles, sxStyles } from "types/commonTypes"
import { ConditionalWrapper } from "../ConditionalWrapper"

const styles = sxStyles({
   chipNormal: {
      color: (theme) => theme.palette.common.black,
      borderColor: (theme) => theme.palette.common.white,
      backgroundColor: (theme) => theme.palette.common.white,
   },
   chipOutlined: {
      color: (theme) => theme.palette.common.white,
      borderColor: (theme) => theme.palette.common.white,
      backgroundColor: "transparent",
   },
})

const WhiteTagChip = ({
   variant = "outlined",
   sx,
   tooltipText,
   label,
   icon,
   ...restProps
}: TagChipProps) => {
   return (
      <ConditionalWrapper
         condition={Boolean(tooltipText)}
         wrapper={(children) => (
            <Tooltip placement="top" arrow title={tooltipText}>
               {children}
            </Tooltip>
         )}
      >
         <Chip
            icon={icon}
            sx={combineStyles(
               { margin: 0 },
               variant === "outlined" ? styles.chipOutlined : styles.chipNormal,
               sx
            )}
            label={label}
            variant={variant}
            color="info"
            {...restProps}
         />
      </ConditionalWrapper>
   )
}

interface TagChipProps extends ChipProps {
   sx?: SxProps<Theme>
   tooltipText?: string
   label: string
   variant?: "outlined" | "filled"
   icon?: JSX.Element
}

export default WhiteTagChip
