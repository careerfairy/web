import useCollection from "../components/custom-hook/useCollection";
import {Interest} from "../types/interests";

const test = () => {
  const interests = useCollection<Interest>("interests")

  console.log(interests)
  return (
    <>
      <div>SignUpListOfInterests</div>

      <ul>
        {interests.length && interests.map((interest, i) => (
          <li key={i}>{interest.name}</li>
        ))}
      </ul>

    </>
  )
}

export default test
