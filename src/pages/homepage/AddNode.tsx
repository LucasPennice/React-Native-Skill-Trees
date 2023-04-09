import { useEffect } from "react";
import { Pressable, View } from "react-native";
import AppText from "../../components/AppText";
import { toggleNewNode, toggleTreeSelector } from "../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../redux/userTreesSlice";
import { clearNewNodeState, selectNewNode } from "../../redux/newNodeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { centerFlex } from "../../types";
import { colors } from "./canvas/parameters";

function AddNode() {
    const currentTree = useAppSelector(selectCurrentTree);
    const newNode = useAppSelector(selectNewNode);

    const dispatch = useAppDispatch();

    if (!currentTree) return <></>;

    if (newNode.id !== "" && newNode.name !== "")
        return (
            <Pressable
                onPress={() => dispatch(clearNewNodeState())}
                style={[
                    centerFlex,
                    {
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: colors.darkGray,
                        height: 50,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "row",
                        gap: 15,
                    },
                ]}>
                <AppText style={{ fontSize: 15, fontFamily: "helvetica", color: colors.accent }}>Cancel</AppText>
            </Pressable>
        );

    return (
        <Pressable
            onPress={() => dispatch(toggleNewNode())}
            style={[
                centerFlex,
                {
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: colors.darkGray,
                    height: 50,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 15,
                },
            ]}>
            <AppText style={{ fontSize: 15, color: colors.unmarkedText }}>Add Node</AppText>
        </Pressable>
    );
}

export default AddNode;
