import {
   Box,
   ButtonBase,
   TableCell,
   TableSortLabel,
   tooltipClasses,
   Typography,
   TypographyProps,
} from "@mui/material"
import { forwardRef } from "react"
import { ChevronDown, IconProps } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedTooltip } from "../../../../streaming-page/components/BrandedTooltip"

const styles = sxStyles({
   headerCell: {
      borderBottom: "none",
      py: 0,
      px: 2,
      backgroundColor: "transparent",
      height: 28,
      borderRadius: "4px",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "brand.white.500",
      },
   },
   headerText: (theme) => ({
      fontWeight: 400,
      ...theme.typography.xsmall,
      color: "common.black",
   }),
   headerTextActive: {
      fontWeight: 600,
   },
})

type HeaderTextProps = TypographyProps & { active?: boolean }

export const HeaderText = ({ children, active, ...props }: HeaderTextProps) => {
   return (
      <Typography
         sx={[styles.headerText, active && styles.headerTextActive]}
         {...props}
      >
         {children}
      </Typography>
   )
}

export const HeaderIcon = forwardRef<HTMLSpanElement, IconProps>(
   (props, ref) => (
      <Box
         component="span"
         id="header-icon"
         ref={ref}
         sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            "& svg": {
               mr: 0,
            },
         }}
      >
         <ChevronDown size={16} {...props} />
      </Box>
   )
)
HeaderIcon.displayName = "HeaderIcon"

type HeaderColumnWrapperProps = {
   children: React.ReactNode
   title: string
}

export const HeaderColumnWrapper = ({
   children,
   title,
}: HeaderColumnWrapperProps) => {
   return (
      <BrandedTooltip
         wrapperStyles={{
            display: "inline-flex",
         }}
         title={title}
         sx={{
            [`& .${tooltipClasses.tooltip}`]: {
               maxWidth: 294,
               textAlign: "start",
            },
         }}
         placement="bottom"
      >
         <Box
            component={ButtonBase}
            disableRipple
            sx={{
               px: 1,
               py: 0.5,
               borderRadius: "4px",
               "&:hover": {
                  backgroundColor: (theme) => theme.brand.white[500],
               },
            }}
         >
            {children}
         </Box>
      </BrandedTooltip>
   )
}

type SortableHeaderCellProps = {
   children: React.ReactNode
   active: boolean
   direction: "asc" | "desc"
   onSort: () => void
   tooltip?: string
}

export const SortableHeaderCell = ({
   children,
   active,
   direction,
   onSort,
   tooltip,
}: SortableHeaderCellProps) => {
   const content = (
      <TableSortLabel
         active={active}
         direction={direction}
         onClick={onSort}
         IconComponent={HeaderIcon}
      >
         <HeaderText active={active}>{children}</HeaderText>
      </TableSortLabel>
   )

   return (
      <TableCell sx={styles.headerCell}>
         {tooltip ? (
            <HeaderColumnWrapper title={tooltip}>{content}</HeaderColumnWrapper>
         ) : (
            content
         )}
      </TableCell>
   )
}

type NonSortableHeaderCellProps = {
   children: React.ReactNode
   tooltip?: string
}

export const NonSortableHeaderCell = ({
   children,
   tooltip,
}: NonSortableHeaderCellProps) => {
   const content = <HeaderText>{children}</HeaderText>

   return (
      <TableCell sx={styles.headerCell}>
         {tooltip ? (
            <HeaderColumnWrapper title={tooltip}>{content}</HeaderColumnWrapper>
         ) : (
            content
         )}
      </TableCell>
   )
}
