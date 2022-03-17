import ConditionalWrapper from "../ConditionalWrapper";
import { Chip, Tooltip } from "@mui/material";
import React from "react";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";
import { ChipProps } from "@mui/material/Chip/Chip";

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
            sx={[
               { margin: 0 },
               variant === "outlined"
                  ? {
                       color: (theme) => theme.palette.common.white,
                       borderColor: (theme) => theme.palette.common.white,
                       backgroundColor: "transparent",
                    }
                  : {
                       color: (theme) => theme.palette.common.black,
                       borderColor: (theme) => theme.palette.common.white,
                       backgroundColor: (theme) => theme.palette.common.white,
                    },
               // You cannot spread `sx` directly because `SxProps` (typeof sx) can be an array.
               ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            label={label}
            variant={variant}
            color="info"
            {...restProps}
         />
      </ConditionalWrapper>
   );
};

interface TagChipProps extends ChipProps {
   sx?: SxProps<Theme>;
   tooltipText?: string;
   label: string;
   variant?: "outlined" | "filled";
   icon?: JSX.Element;
}

export default WhiteTagChip;
