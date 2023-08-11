import { Canvas, Group, Path } from "@shopify/react-native-skia";
import { NODE_MENU_SIZE, colors } from "../../../parameters";
import { SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";

type Props = {
    drag: { x: SharedValue<number>; y: SharedValue<number> };
};

const CANVAS_SIZE = 200;
const STROKE_WIDTH = 16;
const RADIUS = NODE_MENU_SIZE / 2 - STROKE_WIDTH / 2;

function DraggingInsideMenuZoneIndicator({ drag }: Props) {
    const nodeCenter = { x: NODE_MENU_SIZE / 2, y: NODE_MENU_SIZE / 2 };

    //CENTRO DEL NODO 👇
    const nodeDisplacement = useSharedValue(Math.sqrt(drag.x.value ** 2 + drag.y.value ** 2));
    const nodeAngleFromCenter = useSharedValue(Math.atan2(drag.y.value, drag.x.value));

    useAnimatedReaction(
        () => [drag.x.value, drag.y.value] as const,
        ([dragX, dragY]: readonly [number, number]) => {
            nodeDisplacement.value = Math.sqrt(dragX ** 2 + dragY ** 2);
            nodeAngleFromCenter.value = Math.atan2(dragY, dragX);
        },
        [drag.x, drag.y]
    );

    const p0 = { x: nodeCenter.x, y: nodeCenter.y - RADIUS };
    const p1 = { x: nodeCenter.x + RADIUS, y: nodeCenter.y };
    const p2 = { x: nodeCenter.x, y: nodeCenter.y + RADIUS };
    const p3 = { x: nodeCenter.x - RADIUS, y: nodeCenter.y };

    const angle = Math.PI / 10;
    const angle2 = Math.PI / 2.4;

    const SIN45 = Math.sqrt(2) / 2;

    const blobCenter = { x: nodeCenter.x - SIN45 * RADIUS, y: nodeCenter.y - SIN45 * RADIUS };

    //Range mapped from node displacement [0 -> 75] 👇  [0 -> 60]
    const blobRadius = useSharedValue(0.4 * nodeDisplacement.value);
    const b1 = useSharedValue({ x: blobCenter.x - Math.cos(angle) * blobRadius.value, y: blobCenter.y + Math.sin(angle) * blobRadius.value });
    const b3 = useSharedValue({ x: blobCenter.x + Math.cos(angle2) * blobRadius.value, y: blobCenter.y - Math.sin(angle2) * blobRadius.value });
    const controlPoints = useSharedValue(getControlPoints({ b1: b1.value, b3: b3.value, nodeCenter }, nodeDisplacement.value));

    useAnimatedReaction(
        () => nodeDisplacement.value,
        (nodeDisplacement: number) => {
            blobRadius.value = 0.4 * nodeDisplacement;

            b1.value = { x: blobCenter.x - Math.cos(angle) * blobRadius.value, y: blobCenter.y + Math.sin(angle) * blobRadius.value };
            b3.value = { x: blobCenter.x + Math.cos(angle2) * blobRadius.value, y: blobCenter.y - Math.sin(angle2) * blobRadius.value };
            controlPoints.value = getControlPoints({ b1: b1.value, b3: b3.value, nodeCenter }, nodeDisplacement);
        },
        [nodeDisplacement]
    );

    const rotateToZeroDeg = Math.PI / 4 + Math.PI / 2;

    return (
        <Canvas style={{ height: CANVAS_SIZE, width: CANVAS_SIZE }}>
            <Group origin={{ x: nodeCenter.x, y: nodeCenter.y }} transform={[{ rotate: rotateToZeroDeg + nodeAngleFromCenter.value }]}>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p0.x} ${p0.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p1.x} ${p1.y}`}
                    style={"stroke"}
                    color={colors.line}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p1.x} ${p1.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p2.x} ${p2.y}`}
                    style={"stroke"}
                    color={colors.line}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p2.x} ${p2.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p3.x} ${p3.y}`}
                    style={"stroke"}
                    color={colors.line}></Path>

                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${b1.value.x} ${b1.value.y} A ${blobRadius.value} ${blobRadius.value} 0 0 1 ${b3.value.x} ${b3.value.y}`}
                    style={"stroke"}
                    strokeCap={"round"}
                    color={colors.line}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p3.x} ${p3.y} C ${controlPoints.value.c1.x} ${controlPoints.value.c1.y} ${controlPoints.value.c2.x} ${controlPoints.value.c2.y} ${b1.value.x} ${b1.value.y}`}
                    style={"stroke"}
                    strokeCap={"round"}
                    color={colors.line}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p0.x} ${p0.y} C ${controlPoints.value.c3.x} ${controlPoints.value.c3.y} ${controlPoints.value.c4.x} ${controlPoints.value.c4.y} ${b3.value.x} ${b3.value.y}`}
                    style={"stroke"}
                    strokeCap={"round"}
                    color={colors.line}></Path>
            </Group>
        </Canvas>
    );
}

export default DraggingInsideMenuZoneIndicator;

function getControlPoints(
    points: { nodeCenter: { x: number; y: number }; b1: { x: number; y: number }; b3: { x: number; y: number } },
    displacement: number
) {
    "worklet";
    const { b1, b3, nodeCenter } = points;

    const controlPointDistance = getControlPointDistance(displacement);
    const SIN45 = Math.sqrt(2) / 2;
    //For the first bezier curve
    const c1 = { x: nodeCenter.x - RADIUS, y: nodeCenter.y - 30 };
    const c2 = { x: b1.x + controlPointDistance * SIN45, y: b1.y + controlPointDistance * SIN45 };
    //For the second bezier curve
    const c3 = { x: nodeCenter.x - 30, y: nodeCenter.y - RADIUS };
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
