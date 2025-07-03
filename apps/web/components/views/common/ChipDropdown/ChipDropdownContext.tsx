import { ReactNode, createContext, useContext, useMemo, useState } from "react"

type ChipDropdownContextType = {
   openDropdownId: string | null
   setOpenDropdownId: (id: string | null) => void
}

const ChipDropdownContext = createContext<ChipDropdownContextType | undefined>(
   undefined
)

export const ChipDropdownProvider = ({ children }: { children: ReactNode }) => {
   const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

   const contextValue = useMemo(
      () => ({
         openDropdownId,
         setOpenDropdownId,
      }),
      [openDropdownId]
   )

   return (
      <ChipDropdownContext.Provider value={contextValue}>
         {children}
      </ChipDropdownContext.Provider>
   )
}

export const useChipDropdownContext = () => {
   const context = useContext(ChipDropdownContext)

   if (!context) {
      throw new Error(
         "useChipDropdownContext must be used within a ChipDropdownProvider"
      )
   }
   return context
}
