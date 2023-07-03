import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Menu,
   MenuItem,
   Pagination,
   SxProps,
   Theme,
   Tooltip,
   tooltipClasses,
   TooltipProps,
} from "@mui/material"
import { type Options } from "@sentry/types"
import useMenuState from "components/custom-hook/useMenuState"
import { FC, useCallback, useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import Link from "../../../common/Link"
import { styled } from "@mui/material/styles"

const styles = sxStyles({
   card: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
   },
   dropdownButton: {
      color: "black",
      textTransform: "none",
      paddingRight: (theme) => theme.spacing(2),
   },
   cardTitleTypographyProps: {
      fontWeight: 500,
   },
   cardContent: {
      paddingX: (theme) => theme.spacing(3),
      paddingTop: 0,
   },
   cardHeader: {
      paddingX: (theme) => theme.spacing(3),
      paddingBottom: (theme) => theme.spacing(1),
   },
   tooltip: {
      marginTop: (theme) => theme.spacing(1),
      marginRight: (theme) => theme.spacing(1),
      cursor: "pointer",
   },
   subheaderLink: {
      textDecoration: "none",
      fontWeight: 600,
   },
   subheaderIcon: {
      width: "18px",
      marginLeft: "5px",
      // offset the icon a little lower
      marginTop: "1px",
   },
})

type Props = {
   title?: React.ReactNode
   subHeader?: React.ReactNode
   options?: OptionsProps["options"]
   optionsHandler?: OptionsProps["handler"]
   helpTooltip?: string
   sx?: SxProps<Theme>
   customAction?: React.ReactNode
   disableTypography?: boolean
}

/**
 * Card to be used on the Admin pages
 */
const CardCustom: FC<Props> = ({
   title,
   options,
   optionsHandler,
   children,
   helpTooltip,
   subHeader,
   sx,
   customAction,
   disableTypography = false,
}) => {
   const action = helpTooltip ? (
      <CustomWidthTooltip title={helpTooltip} arrow>
         <InfoOutlinedIcon />
      </CustomWidthTooltip>
   ) : options ? (
      <Options
         options={options}
         handler={optionsHandler ? optionsHandler : undefined}
      />
   ) : customAction ? (
      customAction
   ) : undefined

   const mergedSxProps = useMemo(
      () => ({
         ...sx,
         ...styles.card,
      }),
      [sx]
   )

   return (
      <Card data-testid="card-custom" sx={mergedSxProps}>
         <CardHeader
            sx={styles.cardHeader}
            title={<span data-testid="card-title">{title}</span>}
            action={action}
            titleTypographyProps={styles.cardTitleTypographyProps}
            disableTypography={disableTypography}
            subheader={<span data-testid="card-subheader">{subHeader}</span>}
         />
         <CardContent sx={styles.cardContent}>
            <span data-testid="card-value">{children}</span>
         </CardContent>
      </Card>
   )
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip sx={styles.tooltip} {...props} classes={{ popper: className }} />
))({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 250,
   },
})

export type OptionsProps = {
   options: readonly string[]
   handler?: (option: string) => void
}

const Options = ({ options, handler }: OptionsProps) => {
   const [selected, setSelected] = useState(options[0])
   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   const handleSelect = useCallback(
      (option: string) => {
         return () => {
            handler?.(option)
            setSelected(option)
            handleClose()
         }
      },
      [handleClose, handler]
   )

   return (
      <div>
         <Button
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            endIcon={<ChevronDown width="16" height={16} />}
            disableRipple={true}
            sx={styles.dropdownButton}
         >
            {selected}
         </Button>
         <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
         >
            {options.map((option) => (
               <MenuItem key={option} onClick={handleSelect(option)}>
                  {option}
               </MenuItem>
            ))}
         </Menu>
      </div>
   )
}

export const SubheaderLink = ({
   link,
   title,
}: {
   link: string
   title: string
}) => {
   return (
      <Link href={link} color="secondary" sx={styles.subheaderLink}>
         <Box display="flex" alignItems="center" mt={1}>
            <span>{title}</span>
            <ChevronRight style={styles.subheaderIcon} />
         </Box>
      </Link>
   )
}

export const StyledPagination = styled(Pagination)(({ theme }) => ({
   "& .MuiPagination-ul li:last-child": {
      display: "block",
   },
   "& .MuiPagination-ul li:last-child button::before": {
      content: "'Next'",
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
         marginRight: theme.spacing(0.1),
         content: "''",
      },
   },
   "& .MuiPagination-ul li:first-of-type": {
      display: "block",
   },
   "& .MuiPagination-ul li:first-of-type button::after": {
      content: "'Previous'",
      marginLeft: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
         marginLeft: theme.spacing(0.1),
         content: "''",
      },
   },
   "& .MuiPagination-ul li button": {
      fontWeight: 500,
      padding: theme.spacing(1, 2),
      [theme.breakpoints.down("sm")]: {
         padding: 0,
      },
      "&.MuiPaginationItem-page": {
         margin: theme.spacing(0, 0.5),
         padding: 0,
      },
   },
   "& .MuiPaginationItem-ellipsis": {
      display: "none",
   },
   ".MuiPagination-ul": {
      justifyContent: "end",
   },
   flex: "none",
   marginTop: 0,
})) as typeof Pagination

const anchorOrigin = {
   vertical: "bottom",
   horizontal: "right",
} as const

const transformOrigin = {
   vertical: "top",
   horizontal: "right",
} as const

export default CardCustom
