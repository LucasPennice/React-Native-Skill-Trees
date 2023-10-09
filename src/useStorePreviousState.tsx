import { useEffect, useRef } from "react";

function useStorePreviousState<T>(stateToStore: T) {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = stateToStore;
    });

    return ref.current;
}

export default useStorePreviousState;
