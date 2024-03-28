export type Nullable<T> = T | null
export type Fn = (...args) => void
export type Listenable = {
   on: (event: string, listener: Fn) => void
   off: (event: string, listener: Fn) => void
}
export type Disposer = () => void

export const listen = (
   /**
    * Rtm channel or client to listen to. eg channel.on('ChannelMessage', listener)
    */
   target: Listenable,
   /**
    * The name of the event to listen for.
    */
   event: string,
   /**
    * The callback function to execute when the event occurs.
    */
   listener: Fn
): Disposer => {
   target.on(event, listener)
   return () => target.off(event, listener)
}
