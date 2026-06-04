import { useEffect, useState } from "react";
import type { UseFetchApiResult } from "../types/fetchApi.type";

export default function useFetchApi<T>(
   apiFunc: () => Promise<T>
): UseFetchApiResult<T> {

   const [loading, setLoading] =
      useState<boolean>(false);

   const [error, setError] =
      useState<string | null>(null);

   const [data, setData] =
      useState<T | null>(null);

   const fetchData = async () => {

      setLoading(true);
      setError(null);

      try {

         const response = await apiFunc();

         setData(response);

      } catch (err) {

         setError("Failed to fetch data");

      } finally {

         setLoading(false);
      }
   };

   useEffect(() => {

      fetchData();

   }, [apiFunc]);

   return {
      loading,
      error,
      data
   };
}