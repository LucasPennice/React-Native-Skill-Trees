import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect } from "react";
import { StackNavigatorParams } from "../../../App";
import { Alert } from "react-native";
import { EventArg } from "@react-navigation/native";

function useNavigationWithoutConfirmNodePosition(
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>,
    shouldBlockNavigation: boolean,
    confirmNodePosition: () => void
) {
    const preventLeaveWithoutSavingChanges = useCallback(
        (
            e: EventArg<
                "beforeRemove",
                true,
                {
                    action: Readonly<{
                        type: string;
                        payload?: object | undefined;
                        source?: string | undefined;
                        target?: string | undefined;
                    }>;
                }
            >
        ) => {
            if (!shouldBlockNavigation) {
                // If we don't have unsaved changes, then we don't need to do anything
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Prompt the user before leaving the screen
            Alert.alert("Discard changes?", "Confirm the node position for the changes to be saved", [
                {
                    text: "Confirm Node Position",
                    style: "cancel",
                    onPress: () => {
                        confirmNodePosition();
                        navigation.dispatch(e.data.action);
                    },
                },
                {
                    text: "Discard",
                    style: "destructive",
                    // If the user confirmed, then we dispatch the action we blocked earlier
                    // This will continue the action that had triggered the removal of the screen
                    onPress: () => navigation.dispatch(e.data.action),
                },
            ]);
        },
        [shouldBlockNavigation, navigation]
    );

    useEffect(() => {
        navigation.addListener("beforeRemove", preventLeaveWithoutSavingChanges);

        return () => {
            navigation.removeListener("beforeRemove", preventLeaveWithoutSavingChanges);
        };
    }, [navigation, preventLeaveWithoutSavingChanges]);
}

export default useNavigationWithoutConfirmNodePosition;
