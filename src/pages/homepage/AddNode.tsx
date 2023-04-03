import { Pressable, View } from "react-native";
import AppText from "../../AppText";
import { toggleNewNode, toggleTreeSelector } from "../../redux/canvasDisplaySettingsSlice";
import { selectCurrentTree } from "../../redux/currentTreeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { centerFlex } from "../../types";
import { colors } from "./canvas/parameters";

function AddNode() {
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const dispatch = useAppDispatch();

    if (!currentTree) return <></>;

    return (
        <Pressable
            onPress={() => dispatch(toggleNewNode())}
            style={[
                centerFlex,
                {
                    position: "absolute",
                    top: 70,
                    right: 10,
                    backgroundColor: colors.line,
                    height: 50,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 15,
                },
            ]}>
            <AppText style={{ fontSize: 15, fontFamily: "helveticaBold" }}>Add Node</AppText>
        </Pressable>
    );
}

export default AddNode;
