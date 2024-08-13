import axios, { AxiosRequestConfig } from "axios"
import { logger } from "firebase-functions/v2"
import config from "../config"

/**
 * Axios instance configured with the base URL for Cloud Functions.
 */
const axiosFunctionsInstance = axios.create({
   baseURL: config.functionsBaseUrl,
})

/**
 * Invokes a Firebase HTTPS Cloud Function.
 *
 * @template TResponse Response type
 * @param {string} functionName Function name
 * @param {AxiosRequestConfig} [options] Optional Axios config
 * @returns {Promise<TResponse>} Function response
 * @throws {Error} If invocation fails
 *
 * @example
 * const result = await invokeFirebaseHttpsFunction<UserData>(
 *   'getUserProfile',
 *   { method: 'POST', data: { userId: '123' } }
 * );
 */
export const invokeFirebaseHttpsFunction = async <TResponse = any>(
   functionName: string,
   options?: Omit<AxiosRequestConfig, "url" | "baseURL">
): Promise<TResponse> => {
   logger.info(`Invoking function: ${config.functionsBaseUrl}/${functionName}`)

   try {
      const response = await axiosFunctionsInstance.request<TResponse>({
         ...options,

         url: `/${functionName}`,
      })
      return response.data
   } catch (error) {
      logger.error(
         `Error invoking Firebase HTTPS function ${functionName}:`,
         error
      )
      throw error
   }
}
