/**
 * Common Presenters functionality
 *
 * Model - View - Presenter (MVP) pattern
 */
export default class BasePresenter<T> {
   constructor(public readonly model: T) {}

   /**
    * Access a Model property by name
    * @param property
    */
   public get<K extends keyof T>(property: K): T[K] {
      return this.model[property]
   }
}
