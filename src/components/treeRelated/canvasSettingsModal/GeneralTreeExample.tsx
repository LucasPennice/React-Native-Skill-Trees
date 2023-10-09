import { View } from "react-native";
import Animated from "react-native-reanimated";
import { CANVAS_SETTINGS_EXAMPLE_NODE_SIZE, CANVAS_SETTINGS_MOCK_NODE, centerFlex } from "../../../parameters";
import AppText from "../../AppText";
import NodeView from "../../NodeView";
import useShowHideStylesWithoutTransitionView from "../hooks/useShowHideStylesWithoutTransitionView";

function GeneralTreeExample({ showIcons, showLabel }: { showLabel: boolean; showIcons: boolean }) {
    const styles = useShowHideStylesWithoutTransitionView(showLabel);

    return (
        <View style={[centerFlex, { gap: 7 }]}>
            <NodeView
                params={{
                    completePercentage: 100,
                    oneColorPerTree: false,
                    showIcons,
                    size: CANVAS_SETTINGS_EXAMPLE_NODE_SIZE,
                }}
                node={CANVAS_SETTINGS_MOCK_NODE}
            />
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
