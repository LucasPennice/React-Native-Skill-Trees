import { mixpanel } from "app/_layout";
import { router } from "expo-router";
import { useRef } from "react";

function useTrackNavigationEvents() {
    const prevRouteName = useRef<string | null>(null);

    const screenListeners = {
        state: (e: unknown) => {
            //@ts-ignore
            const currentRouteName = e.data.state.routes[e.data.state.routes.length - 1].name as string;

            if (prevRouteName.current !== currentRouteName) mixpanel.track(`NAVIGATION ${currentRouteName}`);

            prevRouteName.current = currentRouteName;

            if (currentRouteName === "[...unmatched]") router.push("/");
        },
    };
    return screenListeners;
}

export default useTrackNavigationEvents;
