import {
   Box,
   ButtonBase,
   TableCell,
   TableCellProps,
   TableSortLabel,
   tooltipClasses,
   Typography,
   TypographyProps,
} from "@mui/material"
import { forwardRef, ReactNode } from "react"
import { ChevronDown, IconProps } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
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
      color: "neutral.900",
   }),
   headerTextActive: {
      fontWeight: 600,
   },
   headerIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      "& svg": {
         mr: 0,
      },
   },
   tooltipWrapper: {
      display: "inline-flex",
   },
   tooltip: {
      [`& .${tooltipClasses.tooltip}`]: {
         maxWidth: 294,
         textAlign: "start",
      },
   },
   headerColumnButton: {
      px: 1,
      py: 0.5,
      borderRadius: "4px",
      transition: (theme) => theme.transitions.create(["background-color"]),
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[500],
      },
   },
   headerColumnButtonActive: {
      backgroundColor: (theme) => theme.brand.white[500],
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
      <Box component="span" ref={ref} sx={styles.headerIcon}>
         <ChevronDown size={16} {...props} />
      </Box>
   )
)
HeaderIcon.displayName = "HeaderIcon"

type HeaderColumnWrapperProps = {
   children: ReactNode
   title: string
}

export const HeaderColumnWrapper = ({
   children,
   title,
}: HeaderColumnWrapperProps) => {
   return (
      <BrandedTooltip
         wrapperStyles={styles.tooltipWrapper}
         title={title}
         sx={styles.tooltip}
         placement="bottom"
      >
         <span>{children}</span>
      </BrandedTooltip>
   )
}

type SortableHeaderCellProps = {
   children: ReactNode
   active: boolean
   direction: "asc" | "desc"
   onSort: () => void
   tooltip?: string
   width?: number | string
   minWidth?: number | string
}

export const SortableHeaderCell = ({
   children,
   active,
   direction,
   onSort,
   tooltip,
   width,
   minWidth,
}: SortableHeaderCellProps) => {
   const content = (
      <TableSortLabel
         active={active}
         direction={direction}
         onClick={onSort}
         IconComponent={HeaderIcon}
         sx={styles.headerColumnButton}
      >
         <HeaderText active={active}>{children}</HeaderText>
      </TableSortLabel>
   )

   return (
      <TableCell sx={[styles.headerCell, { width, minWidth }]}>
         {tooltip ? (
            <HeaderColumnWrapper title={tooltip}>{content}</HeaderColumnWrapper>
         ) : (
            content
         )}
      </TableCell>
   )
}

type NonSortableHeaderCellProps = {
   tooltip?: string
   width?: number | string
   minWidth?: number | string
} & TableCellProps & { active?: boolean }

export const NonSortableHeaderCell = ({
   children,
   tooltip,
   sx,
   active,
   width,
   minWidth,
   ...props
}: NonSortableHeaderCellProps) => {
   const content = <HeaderText>{children}</HeaderText>

   return (
      <TableCell
         sx={combineStyles(styles.headerCell, { width, minWidth }, sx)}
         {...props}
      >
         {tooltip ? (
            <HeaderColumnWrapper title={tooltip}>
               <Box
                  component={ButtonBase}
                  sx={[
                     styles.headerColumnButton,
                     active && styles.headerColumnButtonActive,
                  ]}
               >
                  {content}
               </Box>
            </HeaderColumnWrapper>
         ) : (
            content
         )}
      </TableCell>
   )
}
