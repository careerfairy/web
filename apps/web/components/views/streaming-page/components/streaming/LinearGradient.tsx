import React, { ReactNode, createContext, useContext, useMemo } from "react"
import { FloatingContent } from "./VideoTrackWrapper"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      transition: (theme) => theme.transitions.create("background"),
      background:
         "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
   },
   showRight: {
      background: {
         tablet:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), linear-gradient(90deg, rgba(34, 34, 34, 0.00) 85.51%, rgba(20, 20, 20, 0.20) 90.74%, rgba(0, 0, 0, 0.70) 100%), transparent 50% / cover no-repeat",
         xs: "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), linear-gradient(90deg, rgba(34, 34, 34, 0.00) 77.5%, rgba(20, 20, 20, 0.18) 86.5%, rgba(0, 0, 0, 0.60) 100%), transparent 50% / cover no-repeat",
      },
   },
   showLeft: {
      background: {
         tablet:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.60) 0%, rgba(20, 20, 20, 0.18) 9.26%, rgba(34, 34, 34, 0.00) 14.49%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
         xs: "linear-gradient(90deg, rgba(0, 0, 0, 0.60) 0%, rgba(20, 20, 20, 0.18) 13.5%, rgba(34, 34, 34, 0.00) 22.5%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
      },
   },
})

type GradientContextType = {
   showRightLinearGradient: boolean
   showLeftLinearGradient: boolean
}

const GradientContext = createContext<GradientContextType>({
   showRightLinearGradient: false,
   showLeftLinearGradient: false,
})

type GradientProviderProps = {
   showRightLinearGradient: boolean
   showLeftLinearGradient: boolean
   children: ReactNode
}

export const GradientProvider = ({
   showRightLinearGradient,
   showLeftLinearGradient,
   children,
}: GradientProviderProps) => {
   const value = useMemo<GradientContextType>(
      () => ({ showRightLinearGradient, showLeftLinearGradient }),
      [showRightLinearGradient, showLeftLinearGradient]
   )
   return (
      <GradientContext.Provider value={value}>
         {children}
      </GradientContext.Provider>
   )
}

export const useGradientContext = () => useContext(GradientContext)

export const LinearGradient = () => {
   const { showLeftLinearGradient, showRightLinearGradient } =
      useGradientContext()
   return (
      <FloatingContent
         sx={[
            styles.root,
            showLeftLinearGradient && styles.showLeft,
            showRightLinearGradient && styles.showRight,
         ]}
      />
   )
}

type GradientControlParams = {
   pageIndex: number
   pagesLength: number
   index: number
   streamsLength: number
   pageSize: number
   layoutRows: number
}

type GradientControlResult = {
   showRightLinearGradient: boolean
   showLeftLinearGradient: boolean
}

export const calculateGradientControl = ({
   pageIndex,
   pagesLength,
   index,
   streamsLength,
   pageSize,
   layoutRows,
}: GradientControlParams): GradientControlResult => {
   const hasNextPage = pagesLength > pageIndex + 1
   const hasPreviousPage = pageIndex > 0
   const isSingleRowMode = layoutRows === 1

   const isLastInPage = index === streamsLength - 1 && index === pageSize - 1
   const isFirstInPage = index === 0

   const showRightLinearGradient =
      isSingleRowMode && isLastInPage && hasNextPage
   const showLeftLinearGradient =
      isSingleRowMode && isFirstInPage && hasPreviousPage

   return {
      showRightLinearGradient,
      showLeftLinearGradient,
   }
}
