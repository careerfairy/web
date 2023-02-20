import {
   Card,
   CardHeader,
   CardContent,
   Button,
   Menu,
   MenuItem,
   Tooltip,
} from "@mui/material"
import { Options } from "@sentry/types"
import useMenuState from "components/custom-hook/useMenuState"
import { useState, useCallback, useMemo } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const styles = sxStyles({
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
})

type Props = {
   title: string
   subHeader?: React.ReactNode
   children: React.ReactNode
   options?: OptionsProps["options"]
   optionsHandler?: OptionsProps["handler"]
   helpTooltip?: string
   minHeight?: string
}

/**
 * Card to be used on the Admin pages
 */
const CardCustom = ({
   title,
   options,
   optionsHandler,
   children,
   minHeight,
   helpTooltip,
   subHeader,
}: Props) => {
   const sxProps = useMemo(() => {
      return minHeight
         ? {
              minHeight,
           }
         : undefined
   }, [minHeight])

   const action = helpTooltip ? (
      <Tooltip title={helpTooltip} sx={styles.tooltip} arrow>
         <InfoOutlinedIcon />
      </Tooltip>
   ) : options ? (
      <Options
         options={options}
         handler={optionsHandler ? optionsHandler : undefined}
      />
   ) : undefined

   return (
      <Card sx={sxProps}>
         <CardHeader
            sx={styles.cardHeader}
            title={title}
            action={action}
            titleTypographyProps={styles.cardTitleTypographyProps}
            subheader={subHeader}
         />
         <CardContent sx={styles.cardContent}>{children}</CardContent>
      </Card>
   )
}

export type OptionsProps = {
   options: string[]
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

const anchorOrigin = {
   vertical: "bottom",
   horizontal: "right",
} as const

const transformOrigin = {
   vertical: "top",
   horizontal: "right",
} as const

export default CardCustom
