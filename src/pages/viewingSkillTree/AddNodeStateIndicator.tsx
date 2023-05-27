import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withSequence, withSpring, withTiming } from "react-native-reanimated";
import AppText from "../../components/AppText";
import { MENU_HIGH_DAMPENING, centerFlex, colors } from "../../parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectCurrentTree } from "../../redux/userTreesSlice";
import { ModalState } from "./ViewingSkillTree";

type Props = {
    openNewNodeModal: () => void;
    updateUserTree: () => void;
    returnToIdleState: () => void;
    resetNewNodePosition: () => void;
    mode: ModalState;
};

function AddNodeStateIndicator({ openNewNodeModal, mode, returnToIdleState, updateUserTree, resetNewNodePosition }: Props) {
    //Redux Store
    const currentTree = useAppSelector(selectCurrentTree);
    const { width } = useAppSelector(selectSafeScreenDimentions);

    const styles = useAnimatedStyle(() => {
        if (mode === "CONFIRM_NEW_NODE_POSITION")
            return { width: withSpring(width - 20, MENU_HIGH_DAMPENING), height: withSpring(50, MENU_HIGH_DAMPENING) };

        if (mode === "PLACING_NEW_NODE") return { width: withSpring(width - 20, MENU_HIGH_DAMPENING), height: withSpring(80, MENU_HIGH_DAMPENING) };

        return {
            width: withSpring(100, MENU_HIGH_DAMPENING),
            height: withSpring(50, MENU_HIGH_DAMPENING),
        };
    }, [mode, currentTree]);

    const opacity = useAnimatedStyle(() => {
        if (mode === "CONFIRM_NEW_NODE_POSITION") return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };

        if (mode === "PLACING_NEW_NODE") return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };

        return { opacity: withSequence(withTiming(0, { duration: 0 }), withTiming(1)) };
    }, [mode, currentTree]);

    if (!currentTree) return <></>;
    if (mode !== "IDLE" && mode !== "CONFIRM_NEW_NODE_POSITION" && mode !== "PLACING_NEW_NODE") return <></>;

    return (
        <Animated.View style={[styles, centerFlex, s.container]}>
            {mode === "IDLE" && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }, opacity]}>
                    <Pressable onPress={openNewNodeModal} style={s.button}>
                        <AppText style={{ color: colors.accent }} textProps={{ ellipsizeMode: "clip", numberOfLines: 1 }} fontSize={15}>
                            Add Node
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {mode === "PLACING_NEW_NODE" && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }, opacity]}>
                    <AppText style={{ color: colors.unmarkedText, width: width - 130 }} fontSize={13}>
                        Click the square where you want to insert your new skill
                    </AppText>
                    <Pressable onPress={returnToIdleState} style={s.button}>
                        <AppText style={{ color: colors.red }} fontSize={15}>
                            Cancel
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {mode === "CONFIRM_NEW_NODE_POSITION" && (
                <Animated.View
                    style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", flex: 1, paddingHorizontal: 10 }, opacity]}>
                    <Pressable onPress={resetNewNodePosition} style={s.button}>
                        <AppText style={{ color: colors.red }} fontSize={15}>
                            Change position
                        </AppText>
                    </Pressable>
                    <Pressable onPress={updateUserTree} style={s.button}>
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

export default AddNodeStateIndicator;
