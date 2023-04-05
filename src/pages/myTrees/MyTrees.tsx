import { ScrollView, TouchableHighlight, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import AppText from "../../AppText";
import { centerFlex, mockSkillTreeArray } from "../../types";
import { colors } from "../homepage/canvas/parameters";
import { ProgressWheelParams } from "../homepage/components/ProgressIndicatorAndName";
import { quantityOfCompletedNodes, quantiyOfNodes } from "../homepage/treeFunctions";

const progressWheelProps = new ProgressWheelParams(colors.orange, `${colors.orange}1D`, 50, 8);

function MyTrees() {
    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 0 }}>
            <AppText style={{ color: "white", fontSize: 32, fontFamily: "helveticaBold", marginBottom: 20 }}>My Trees</AppText>
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
                                backgroundColor: colors.darkGray,
                                marginBottom: 30,
                                height: 100,
                                borderRadius: 10,
                                paddingHorizontal: 20,
                            },
                        ]}>
                        <View>
                            <AppText style={{ color: "white", fontSize: 20, fontFamily: "helveticaBold" }}>{element.treeName ?? "tree"}</AppText>
                            <AppText style={{ color: "#FFFFFF5D", fontSize: 20 }}>{completedPercentage.toFixed(0)}% Complete</AppText>
                            <AppText style={{ color: "#FFFFFF5D", fontSize: 20 }}>
                                {completedNodesQty} skills of {nodesQty}
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
                );
            })}
        </ScrollView>
    );
}

export default MyTrees;
