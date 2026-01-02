/**
 * Type declarations for front-matter package
 * Since @types/front-matter doesn't exist, we define them manually
 */

declare module 'front-matter' {
  export interface FrontMatterResult<T> {
    attributes: T;
    body: string;
    bodyBegin: number;
  }

  function fm<T = any>(content: string): FrontMatterResult<T>;

  export default fm;
}
