export interface UseFetchApiResult<T> {
   loading: boolean;
   error: string | null;
   data: T | null;
}