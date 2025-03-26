import axios from "axios"
import config from "../config"

const functionsAxios = axios.create({
   baseURL: config.functionsBaseUrl,
   headers: {
      "Content-Type": "application/json",
   },
})

export default functionsAxios
