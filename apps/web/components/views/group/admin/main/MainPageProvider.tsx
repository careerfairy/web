import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { createContext, useContext, useMemo } from "react"

type DefaultContext = {
   livestreamStats: LiveStreamStats[] | null // null => not loaded yet
}

const MainPageContext = createContext<DefaultContext>({
   livestreamStats: null,
})

type Props = {
   children: React.ReactNode
   livestreamStats: LiveStreamStats[]
}

const MainPageProvider = ({ children, livestreamStats }: Props) => {
   const values = useMemo(() => {
      return {
         livestreamStats,
      }
   }, [livestreamStats])

   return (
      <MainPageContext.Provider value={values}>
         {children}
      </MainPageContext.Provider>
   )
}

const useMainPageContext = () => useContext<DefaultContext>(MainPageContext)

export { MainPageProvider, useMainPageContext }
