import { View } from "react-native";
import Animated from "react-native-reanimated";
import { centerFlex } from "../../../parameters";
import AppText from "../../AppText";
import NodeView from "../../NodeView";
import useShowHideStylesWithoutTransitionView from "../hooks/useShowHideStylesWithoutTransitionView";
import { CanvasSettingsMockNode, CanvasSettingsNodeSize } from "./params";

function GeneralTreeExample({ showIcons, showLabel }: { showLabel: boolean; showIcons: boolean }) {
    const styles = useShowHideStylesWithoutTransitionView(showLabel);

    return (
        <View style={[centerFlex, { gap: 7 }]}>
            <NodeView completePercentage={100} node={CanvasSettingsMockNode} size={CanvasSettingsNodeSize} hideIcon={!showIcons} />
            <View style={{ marginBottom: 10, height: 16, width: 60, overflow: "hidden" }}>
                <Animated.View style={styles}>
                    <AppText style={{ color: "#FFFFFF" }} fontSize={15}>
                        Example
                    </AppText>
                </Animated.View>
            </View>
        </View>
    );
}

export default GeneralTreeExample;
