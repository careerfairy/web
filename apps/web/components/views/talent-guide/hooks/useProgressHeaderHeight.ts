import { useContext } from "react"
import { HeaderHeightContext } from "../context/HeaderHeightContext"

export const useProgressHeaderHeight = () => {
   return useContext(HeaderHeightContext)
}
