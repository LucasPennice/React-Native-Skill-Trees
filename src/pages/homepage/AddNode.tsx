import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AppText from "../../components/AppText";
import { toggleNewNode } from "../../redux/canvasDisplaySettingsSlice";
import {
    clearNewNodeState,
    mutateUserTree,
    selectCurrentTree,
    selectTentativeTree,
    selectTreeSlice,
    setSelectedDndZone,
} from "../../redux/userTreesSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { MENU_HIGH_DAMPENING, centerFlex } from "../../types";
import { colors } from "./canvas/parameters";
import Animated, { useAnimatedStyle, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";

type MODES = "IDLE" | "SELECT_POSITION" | "CONFIRM_POSITION";

function AddNode() {
    //Redux Store
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedDndZone, newNode } = useAppSelector(selectTreeSlice);
    const tentativeNewTree = useAppSelector(selectTentativeTree);
    const { width } = useAppSelector(selectScreenDimentions);
    const dispatch = useAppDispatch();
    //Local State
    const [mode, setMode] = useState<MODES>("IDLE");

    useEffect(() => {
        if (selectedDndZone) return setMode("CONFIRM_POSITION");
        if (newNode) return setMode("SELECT_POSITION");

        return setMode("IDLE");
    }, [selectedDndZone, newNode]);

    const styles = useAnimatedStyle(() => {
        if (mode === "CONFIRM_POSITION") return { width: withSpring(width - 20, MENU_HIGH_DAMPENING), height: withSpring(50, MENU_HIGH_DAMPENING) };

        if (mode === "SELECT_POSITION") return { width: withSpring(width - 20, MENU_HIGH_DAMPENING), height: withSpring(80, MENU_HIGH_DAMPENING) };

        return {
            width: withSpring(100, MENU_HIGH_DAMPENING),
            height: withSpring(50, MENU_HIGH_DAMPENING),
        };
    }, [mode, currentTree]);

    const opacity = useAnimatedStyle(() => {
        if (mode === "CONFIRM_POSITION") return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };

        if (mode === "SELECT_POSITION") return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };

        return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };
    }, [mode, currentTree]);

    if (!currentTree) return <></>;

    return (
        <Animated.View style={[styles, centerFlex, s.container]}>
            {mode === "IDLE" && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }, opacity]}>
                    <Pressable onPress={() => dispatch(toggleNewNode())} style={s.button}>
                        <AppText style={{ color: colors.accent }} fontSize={15}>
                            Add Node
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {mode === "SELECT_POSITION" && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }, opacity]}>
                    <AppText style={{ color: colors.unmarkedText, width: width - 130 }} fontSize={13}>
                        Click the square where you want to insert your new skill
                    </AppText>
                    <Pressable onPress={() => dispatch(clearNewNodeState())} style={s.button}>
                        <AppText style={{ color: colors.red }} fontSize={15}>
                            Cancel
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {mode === "CONFIRM_POSITION" && (
                <Animated.View
                    style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", flex: 1, paddingHorizontal: 10 }, opacity]}>
                    <Pressable onPress={() => dispatch(setSelectedDndZone(undefined))} style={s.button}>
                        <AppText style={{ color: colors.red }} fontSize={15}>
                            Change position
                        </AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            dispatch(mutateUserTree(tentativeNewTree));
                            dispatch(setSelectedDndZone(undefined));
                            dispatch(clearNewNodeState());
                        }}
                        style={s.button}>
                        <AppText style={{ color: colors.accent }} fontSize={15}>
                            Confirm
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
        </Animated.View>
    );
}

const s = StyleSheet.create({
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        paddingHorizontal: 10,
    },
    container: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: colors.darkGray,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        gap: 15,
    },
});

export default AddNode;
