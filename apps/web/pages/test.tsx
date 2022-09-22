import { FunctionsInstance } from "../data/firebase/FirebaseInstance"

const Test = () => {
   const click = () => {
      console.log("clicked")

      FunctionsInstance.httpsCallable("getRegistrationSources")({
         groupId: "group3", // used to validate the user making the request
         livestreamIds: [
            "4Xy1Hf2x0n9AxV2YkxPg",
            "Y6o1cdBF6JSSvpnqNPVO",
            // "C09wB5AYBdl5YsqmQ8Gd",
            // "5Wb2ryMuZS0GUF2cHzTs",
            // "DTBjybJ2YnicjZNAoI4Z",
            // "X7p6RcL2I3qiljZlOIKJ",
            // "73ZfKFMHDSYNrGHCsIEH",
            // "L1G1b0H9M324Pp7bUG7l",
            // "9BpR6alo8n033XyLxEpe",
            // "FZMZoWNWgZe7XkMawZaj",
            // "rQaYFx5v8NrxSyT20y19",
            // "q8YLZhuNIkO2HVkTc9zD",
         ],
      })
         .then((res) => {
            console.log("Response", res)
         })
         .catch(console.error)
   }

   return (
      <div>
         <button onClick={click}>click me</button>
      </div>
   )
}

export default Test
