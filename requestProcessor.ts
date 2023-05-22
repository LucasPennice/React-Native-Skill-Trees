import { MutationKey, QueryKey, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useRequestProcessor() {
    const queryClient = useQueryClient();

    function query<T>(key: QueryKey, queryFunction: () => Promise<T>, options: UseQueryOptions<T>) {
        return useQuery<T>({
            queryKey: key,
            queryFn: queryFunction,
            ...options,
        });
    }

    function mutate<T>(key: MutationKey, mutationFunction: () => Promise<T>, options: UseMutationOptions<T>) {
        return useMutation({
            mutationKey: key,
            mutationFn: mutationFunction,
            onSettled: () => queryClient.invalidateQueries(key),
            ...options,
        });
    }

    function resetQuery(keys: QueryKey) {
        return queryClient.resetQueries({ queryKey: keys, exact: true });
    }

    return { query, mutate, resetQuery, invalidateQueries: queryClient.invalidateQueries };
}
