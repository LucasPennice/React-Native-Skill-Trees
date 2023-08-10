import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Canvas, Circle, Group, Path } from "@shopify/react-native-skia";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { selectCanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectUserTrees } from "../../redux/userTreesSlice";

type Props = NativeStackScreenProps<StackNavigatorParams, "Home">;

function Homepage(props: Props) {
    const { navigation } = props;
    const userTrees = useAppSelector(selectUserTrees);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const userTreesChildrenQty = userTrees.length;

    const userHasAtLestOneTree = userTreesChildrenQty !== 0;

    const openCreateNewTree = () => {
        navigation.navigate("MyTrees", { openNewTreeModal: true });
    };

    //RANGO 👇 de 0 a 150
    const nodeDisplacement = 75;

    function getControlPoints(b1: { x: number; y: number }, displacement: number) {
        const controlPointDistance = getControlPointDistance(displacement);
        const SIN45 = Math.sqrt(2) / 2;
        //For the first bezier curve
        const c1 = { x: center.x - radius, y: center.y - 30 };
        const c2 = { x: b1.x + controlPointDistance * SIN45, y: b1.y + controlPointDistance * SIN45 };
        //For the second bezier curve
        const c3 = { x: center.x - 30, y: center.y - radius };
        const c4 = { x: b3.x + controlPointDistance * SIN45, y: b3.y + controlPointDistance * SIN45 };

        return { c1, c2, c3, c4 };

        function getControlPointDistance(displacement: number) {
            switch (true) {
                case displacement <= 4:
                    return -1;
                case displacement <= 5:
                    return 0;
                case displacement <= 10:
                    return 2;
                case displacement <= 20:
                    return 5;
                case displacement <= 30:
                    return 6;
                case displacement <= 40:
                    return 7;
                case displacement <= 50:
                    return 5;
                case displacement <= 75:
                    return 0;
                default:
                    return 0;
            }
        }
    }

    //CENTRO DEL NODO 👇
    const center = { x: 200, y: 200 };
    const dragX = 0;
    const dragY = 0;

    const radius = 75;
    const p0 = { x: center.x, y: center.y - radius };
    const p1 = { x: center.x + radius, y: center.y };
    const p2 = { x: center.x, y: center.y + radius };
    const p3 = { x: center.x - radius, y: center.y };

    const angle = Math.PI / 10;
    const angle2 = Math.PI / 2.4;

    const SIN45 = Math.sqrt(2) / 2;
    const blobCenter = { x: center.x - SIN45 * radius, y: center.y - SIN45 * radius };
    //Range mapped from node displacement [0 -> 75] 👇  [0 -> 60]
    const blobRadius = 0.4 * nodeDisplacement;

    const b1 = { x: blobCenter.x - Math.cos(angle) * blobRadius, y: blobCenter.y + Math.sin(angle) * blobRadius };
    const b3 = { x: blobCenter.x + Math.cos(angle2) * blobRadius, y: blobCenter.y - Math.sin(angle2) * blobRadius };
    const rotation = 0;

    const mockNodeCoord = { x: center.x - (Math.sqrt(2) / 2) * nodeDisplacement, y: center.y - (Math.sqrt(2) / 2) * nodeDisplacement };

    const controlPoints = getControlPoints(b1, nodeDisplacement);

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            <Canvas style={{ width: 1000, height: 1000, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] }}>
                <Group origin={{ x: center.x, y: center.y }} transform={[{ rotate: rotation }]}>
                    <Path
                        strokeWidth={16}
                        path={`M ${p0.x} ${p0.y} A ${radius} ${radius} 0 0 1 ${p1.x} ${p1.y}`}
                        style={"stroke"}
                        color={"#FFFFFF"}></Path>
                    <Path
                        strokeWidth={16}
                        path={`M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`}
                        style={"stroke"}
                        color={"#FFFFFF"}></Path>
                    <Path
                        strokeWidth={16}
                        path={`M ${p2.x} ${p2.y} A ${radius} ${radius} 0 0 1 ${p3.x} ${p3.y}`}
                        style={"stroke"}
                        color={"#FFFFFF"}></Path>

                    <Path
                        strokeWidth={16}
                        path={`M ${b1.x} ${b1.y} A ${blobRadius} ${blobRadius} 0 0 1 ${b3.x} ${b3.y}`}
                        style={"stroke"}
                        strokeCap={"round"}
                        color={"#FFFFFF"}></Path>
                    <Path
                        strokeWidth={16}
                        path={`M ${p3.x} ${p3.y} C ${controlPoints.c1.x} ${controlPoints.c1.y} ${controlPoints.c2.x} ${controlPoints.c2.y} ${b1.x} ${b1.y}`}
                        style={"stroke"}
                        strokeCap={"round"}
                        color={"#FFFFFF"}></Path>
                    <Path
                        strokeWidth={16}
                        path={`M ${p0.x} ${p0.y} C ${controlPoints.c3.x} ${controlPoints.c3.y} ${controlPoints.c4.x} ${controlPoints.c4.y} ${b3.x} ${b3.y}`}
                        style={"stroke"}
                        strokeCap={"round"}
                        color={"#FFFFFF"}></Path>
                    <Circle cx={mockNodeCoord.x} cy={mockNodeCoord.y} r={30} style={"fill"} color={"pink"} />
                </Group>
            </Canvas>
        </View>
    );
}
export default Homepage;
