import { Pressable, View } from "react-native";
import AppText from "../../AppText";
import { toggleTreeSelector } from "../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch } from "../../redux/reduxHooks";
import { centerFlex } from "../../types";
import { colors } from "./canvas/parameters";

function ChooseTree() {
    const dispatch = useAppDispatch();

    return (
        <Pressable
            onPress={() => dispatch(toggleTreeSelector())}
            style={[
                centerFlex,
                {
                    position: "absolute",
                    top: 10,
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
            <AppText style={{ fontSize: 15, fontFamily: "helveticaBold" }}>Choose Tree</AppText>
        </Pressable>
    );
}

export default ChooseTree;
