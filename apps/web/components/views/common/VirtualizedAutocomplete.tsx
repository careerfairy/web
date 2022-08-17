import * as React from "react"
import { HTMLAttributes } from "react"
import Autocomplete, {
   autocompleteClasses,
   AutocompleteProps,
} from "@mui/material/Autocomplete"
import useMediaQuery from "@mui/material/useMediaQuery"
import ListSubheader from "@mui/material/ListSubheader"
import Popper from "@mui/material/Popper"
import { styled, useTheme } from "@mui/material/styles"
import { ListChildComponentProps, VariableSizeList } from "react-window"
import Typography from "@mui/material/Typography"

const LISTBOX_PADDING = 8 // px
/*
 * Taken from https://mui.com/material-ui/react-autocomplete/#virtualization
 * */
function renderRow(props: ListChildComponentProps) {
   const { data, index, style } = props
   const dataSet = data[index]
   const inlineStyle = {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
   }

   if (dataSet.hasOwnProperty("group")) {
      return (
         <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
            {dataSet.group}
         </ListSubheader>
      )
   }

   return (
      <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
         {dataSet[1]}
      </Typography>
   )
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
   const outerProps = React.useContext(OuterElementContext)
   return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data: any) {
   const ref = React.useRef<VariableSizeList>(null)
   React.useEffect(() => {
      if (ref.current != null) {
         ref.current.resetAfterIndex(0, true)
      }
   }, [data])
   return ref
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
   HTMLDivElement,
   React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
   const { children, ...other } = props
   const itemData: React.ReactChild[] = []
   ;(children as React.ReactChild[]).forEach(
      (item: React.ReactChild & { children?: React.ReactChild[] }) => {
         itemData.push(item)
         itemData.push(...(item.children || []))
      }
   )

   const theme = useTheme()
   const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
      noSsr: true,
   })
   const itemCount = itemData.length
   const itemSize = smUp ? 36 : 48

   const getChildSize = (child: React.ReactChild) => {
      if (child.hasOwnProperty("group")) {
         return 48
      }

      return itemSize
   }

   const getHeight = () => {
      if (itemCount > 8) {
         return 8 * itemSize
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
   }

   const gridRef = useResetCache(itemCount)

   return (
      <div ref={ref}>
         <OuterElementContext.Provider value={other}>
            <VariableSizeList
               itemData={itemData}
               height={getHeight() + 2 * LISTBOX_PADDING}
               width="100%"
               ref={gridRef}
               outerElementType={OuterElementType}
               innerElementType="ul"
               itemSize={(index) => getChildSize(itemData[index])}
               overscanCount={5}
               itemCount={itemCount}
            >
               {renderRow}
            </VariableSizeList>
         </OuterElementContext.Provider>
      </div>
   )
})

const StyledPopper = styled(Popper)({
   [`& .${autocompleteClasses.listbox}`]: {
      boxSizing: "border-box",
      "& ul": {
         padding: 0,
         margin: 0,
      },
   },
})

interface VirtualizedAutocompleteProps<T>
   extends AutocompleteProps<T, boolean, boolean, boolean> {
   options: T[]
   groupBy?: (option: T) => string
   renderOption: (
      props: HTMLAttributes<HTMLLIElement>,
      option: T
   ) => React.ReactNode
   label?: string
   getOptionLabel?: (option: T) => string
   fullWidth?: boolean
}
const VirtualizedAutocomplete = <T extends unknown>({
   groupBy,
   options,
   label,
   renderOption,
   getOptionLabel,
   fullWidth,
   ...rest
}: VirtualizedAutocompleteProps<T>) => (
   <Autocomplete
      disableListWrap
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      options={options}
      groupBy={groupBy}
      fullWidth={fullWidth}
      getOptionLabel={getOptionLabel}
      // TODO: Post React 18 update - validate this conversion, look like a hidden bug
      renderGroup={(params) => params as unknown as React.ReactNode}
      renderOption={renderOption}
      {...rest}
   />
)
export default VirtualizedAutocomplete
