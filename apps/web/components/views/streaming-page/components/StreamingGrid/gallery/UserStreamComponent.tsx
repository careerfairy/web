import { LocalUserStream, LocalScreenStream } from "../../streaming/LocalStream"
import { RemoteStreamer } from "../../streaming"
import { UserStreamProvider } from "components/views/streaming-page/context/UserStream"
import { UserStream } from "components/views/streaming-page/types"

type Props = {
   user: UserStream
}

export const UserStreamComponent = ({ user }: Props) => {
   return (
      <UserStreamProvider user={user}>
         {user.type === "local-user" ? (
            <LocalUserStream />
         ) : user.type === "local-user-screen" ? (
            <LocalScreenStream />
         ) : (
            <RemoteStreamer />
         )}
      </UserStreamProvider>
   )
}
