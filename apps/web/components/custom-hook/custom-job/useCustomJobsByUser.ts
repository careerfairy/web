type Options = {
   totalItems: number
   disabled?: boolean
}

/**
 * Fetches the custom jobs according to the specified options.
 **/
const useCustomJobsByUser = (options?: Options) => {
   console.log("🚀 ~ useCustomJobsByUser ~ options:", options)
   // const { userData } = useAuth()

   // const businessFunctions = userData?.businessFunctionsTagIds || []

   // const { totalItems, businessFunctionTagIds, disabled, ignoreIds = [] } = options

   // const [itemsPerBatch, setItemsPerBatch] = useState<number>(totalItems)

   // const { data } = useSWR(
   //     disabled ? null : ["get-custom-jobs", totalItems, businessFunctionTagIds, ignoreIds],
   //     async () => {
   //         const querySnapshot = await getDocs(
   //             query(
   //                 collection(FirestoreInstance, "customJobs"),
   //                 where("deadline", ">", new Date()),
   //                 orderBy("deadline", "desc"),
   //                 ...(businessFunctionTagIds.length
   //                     ? [
   //                         where(
   //                             "businessFunctionsTagIds",
   //                             "array-contains",
   //                             businessFunctionTagIds
   //                         ),
   //                     ]
   //                     : []),
   //                 limit(itemsPerBatch)
   //             ).withConverter(createGenericConverter<CustomJob>())
   //         )

   //         return querySnapshot.docs.map((doc) => doc.data())
   //     },
   //     {
   //         ...reducedRemoteCallsOptions,
   //         onError: (error, key) => {
   //             errorLogAndNotify(error, {
   //                 key,
   //                 businessFunctionTagIds,
   //                 totalItems,
   //             })
   //         },
   //     }
   // )

   // return {
   //     customJobs: data,
   //     setItemsPerBatch
   // }
}

export default useCustomJobsByUser
