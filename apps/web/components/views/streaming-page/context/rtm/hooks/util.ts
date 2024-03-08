export type Nullable<T> = T | null
export type Fn = (...args) => void
export type Listenable = {
   on: (event: string, listener: Fn) => void
   off: (event: string, listener: Fn) => void
}
export type Disposer = () => void

export const listen = (
   channel: Listenable,
   event: string,
   listener: Fn
): Disposer => {
   channel.on(event, listener)
   return () => channel.off(event, listener)
}
