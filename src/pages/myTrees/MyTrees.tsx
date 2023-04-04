import { ScrollView, TouchableHighlight, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import AppText from "../../AppText";
import { centerFlex, mockSkillTreeArray } from "../../types";
import { colors } from "../homepage/canvas/parameters";
import { ProgressWheelParams } from "../homepage/components/ProgressIndicatorAndName";
import { quantityOfCompletedNodes, quantiyOfNodes } from "../homepage/treeFunctions";

const progressWheelProps = new ProgressWheelParams(colors.orange, colors.background, 45, 10);

function MyTrees() {
    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, padding: 20 }}>
            {mockSkillTreeArray.map((element, idx) => {
                const completedNodesQty = quantityOfCompletedNodes(element);
                const nodesQty = quantiyOfNodes(element);

                let completedPercentage = 0;

                if (!completedNodesQty || !nodesQty) completedPercentage = 0;

                completedPercentage = ((completedNodesQty ?? 0) / (nodesQty ?? 1)) * 100;

                const result = progressWheelProps.circumference - (progressWheelProps.circumference * completedPercentage) / 100;

                return (
                    <View
                        key={idx}
                        style={[
                            centerFlex,
                            {
                                flexDirection: "row",
                                justifyContent: "space-between",
                                backgroundColor: colors.line,
                                marginBottom: 30,
                                height: 120,
                                borderRadius: 10,
                                paddingHorizontal: 20,
                            },
                        ]}>
                        <View style={{ display: "flex", flexDirection: "row", gap: 30 }}>
                            <View>
                                <AppText style={{ color: colors.background, fontSize: 20, fontFamily: "helveticaBold" }}>
                                    {element.treeName ?? "tree"}
                                </AppText>
                                <AppText style={{ color: "gray", fontSize: 22 }}>
                                    {completedNodesQty} / {nodesQty}
                                </AppText>
                            </View>
                            <Svg width={progressWheelProps.size} height={progressWheelProps.size}>
                                <Circle
                                    strokeWidth={progressWheelProps.strokeWidth}
                                    cx={progressWheelProps.centerCoordinate}
                                    cy={progressWheelProps.centerCoordinate}
                                    r={progressWheelProps.radius}
                                    stroke={progressWheelProps.backgroundStroke}
                                />
                                <Circle
                                    strokeWidth={progressWheelProps.strokeWidth}
                                    cx={progressWheelProps.centerCoordinate}
                                    cy={progressWheelProps.centerCoordinate}
                                    r={progressWheelProps.radius}
                                    stroke={progressWheelProps.progressStroke}
                                    strokeDasharray={progressWheelProps.circumference}
                                    strokeLinecap="round"
                                    strokeDashoffset={result}
                                />
                            </Svg>
                        </View>
                        <View style={[centerFlex, { gap: 10 }]}>
                            <TouchableHighlight
                                style={[centerFlex, { paddingVertical: 10, borderRadius: 10, backgroundColor: colors.background, width: 75 }]}>
                                <AppText style={{ fontSize: 15, color: `${colors.green}` }}>Edit</AppText>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={[centerFlex, { paddingVertical: 10, borderRadius: 10, backgroundColor: colors.background, width: 75 }]}>
                                <AppText style={{ fontSize: 15, color: `${colors.accent}` }}>Delete</AppText>
                            </TouchableHighlight>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

export default MyTrees;
