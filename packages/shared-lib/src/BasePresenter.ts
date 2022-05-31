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
   public get(property: keyof T): T[keyof T] {
      return this.model[property]
   }
}
