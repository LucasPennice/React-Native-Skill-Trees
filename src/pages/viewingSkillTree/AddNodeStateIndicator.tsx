import { memo } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import AppText from "../../components/AppText";
import { centerFlex, colors } from "../../parameters";
import { Skill, Tree } from "../../types";
import useHandleStateIndicatorAnimations from "./useHandleStateIndicatorAnimations";
import { ModalState } from "app/(app)/myTrees/[treeId]";

type Props = {
    functions: {
        openNewNodePositionSelector: () => void;
        returnToIdleState: () => void;
    };
    mode: ModalState;
    currentTree: Tree<Skill>;
};

function AddNodeStateIndicator({ mode, functions }: Props) {
    const { openNewNodePositionSelector, returnToIdleState } = functions;
    //Redux Store
    const { width } = Dimensions.get("screen");

    const { opacity, styles } = useHandleStateIndicatorAnimations(mode);

    const showAddNode = mode !== "PLACING_NEW_NODE";

    return (
        <Animated.View style={[styles, opacity, centerFlex, s.container]}>
            {showAddNode && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }]} entering={FadeIn.duration(100)}>
                    <Pressable onPress={openNewNodePositionSelector} style={s.button}>
                        <AppText style={{ color: colors.accent }} textProps={{ ellipsizeMode: "clip", numberOfLines: 1 }} fontSize={15}>
                            Add Node
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {mode === "PLACING_NEW_NODE" && (
                <Animated.View style={[centerFlex, { flexDirection: "row", gap: 20 }]} entering={FadeIn.duration(100)}>
                    <AppText style={{ color: colors.unmarkedText, width: width - 130 }} fontSize={13}>
                        Click the position where you want to insert your new skills. Or, long-press a node and choose "add" from the options.
                    </AppText>
                    <Pressable onPress={returnToIdleState} style={s.button}>
                        <AppText style={{ color: colors.red }} fontSize={15}>
                            Cancel
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

export default memo(AddNodeStateIndicator);
