import analytics from "@react-native-firebase/analytics";
import { mixpanel } from "app/(app)/_layout";
import { useRef } from "react";

function useTrackNavigationEvents() {
    const prevRouteName = useRef<string | null>(null);

    const screenListeners = {
        state: async (e: unknown) => {
            //@ts-ignore
            const currentRouteName = e.data.state.routes[e.data.state.routes.length - 1].name as string;

            if (prevRouteName.current !== currentRouteName) {
                await analytics().logScreenView({
                    screen_name: currentRouteName,
                    screen_class: currentRouteName,
                });
                await mixpanel.track(`Navigate to ${currentRouteName}`);
            }

            prevRouteName.current = currentRouteName;
        },
    };
    return screenListeners;
}

export default useTrackNavigationEvents;
