export const useUniversityByIdSWR = (
   universityId: string,
   suspense: boolean = true
) => {
   console.log("🚀 ~ useUniversityByIdSWR ~ suspense:", suspense)
   console.log("🚀 ~ useUniversityByIdSWR ~ universityId:", universityId)
   throw "Not implemented yet"
   //    const firestore = useFirestore()

   //    return useSWR<StudyBackground[]>(
   //       `get-university-by-id-${universityId}`,
   //       async () => {
   //          const studyBackgroundsQuery = query(
   //             collection(firestore, `universitiesByCountry`),
   //             where("universities", "array-contains", false)
   //          ).withConverter(createGenericConverter<StudyBackground>())

   //          const querySnapshot = await getDocs(studyBackgroundsQuery)

   //          return querySnapshot.docs.map((doc) => doc.data()) || []
   //       },
   //       {
   //          suspense,
   //          onError: (error) =>
   //             errorLogAndNotify(
   //                error,
   //                `Failed to fetch university with id: ${universityId}`
   //             ),
   //       }
   //    )
}
