import { Canvas, Group, Path } from "@shopify/react-native-skia";
import { SharedValue, useAnimatedReaction, useSharedValue, withSpring } from "react-native-reanimated";
import { NODE_MENU_SIZE } from "../../../parameters";

type Props = {
    drag: { x: SharedValue<number>; y: SharedValue<number> };
};

const CANVAS_SIZE = 210;
const STROKE_WIDTH = 8;
const RADIUS = NODE_MENU_SIZE / 2 - STROKE_WIDTH / 2;
const COLOR = `#585858`;

function DraggingInsideMenuZoneIndicator({ drag }: Props) {
    const nodeCenter = { x: NODE_MENU_SIZE / 2 + 30, y: NODE_MENU_SIZE / 2 + 30 };
    const rotateToZeroDeg = Math.PI / 4 + Math.PI / 2;

    //CENTRO DEL NODO 👇
    const nodeDisplacement = useSharedValue(Math.sqrt(drag.x.value ** 2 + drag.y.value ** 2));
    const rotateIndicator = useSharedValue(rotateToZeroDeg);

    useAnimatedReaction(
        () => [drag.x.value, drag.y.value] as const,
        ([dragX, dragY]: readonly [number, number]) => {
            const updatedDisplacement = Math.sqrt(dragX ** 2 + dragY ** 2);
            nodeDisplacement.value = withSpring(updatedDisplacement >= 75 ? 75 : Math.sqrt(dragX ** 2 + dragY ** 2));
            rotateIndicator.value = rotateToZeroDeg + Math.atan2(rotateToZeroDeg + dragY, dragX);
        },
        [drag.x, drag.y]
    );

    const rotationTransform = useSharedValue([{ rotate: rotateIndicator.value }]);

    useAnimatedReaction(
        () => rotateIndicator.value,
        (rotateIndicator: number) => {
            rotationTransform.value = [{ rotate: rotateIndicator }];
        },
        [rotateIndicator]
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

    const path1 = useSharedValue("");
    const path2 = useSharedValue("");
    const path3 = useSharedValue("");

    useAnimatedReaction(
        () => nodeDisplacement.value,
        (nodeDisplacement: number) => {
            blobRadius.value = 0.4 * nodeDisplacement;

            const b1 = { x: blobCenter.x - Math.cos(angle) * blobRadius.value, y: blobCenter.y + Math.sin(angle) * blobRadius.value };
            const b3 = { x: blobCenter.x + Math.cos(angle2) * blobRadius.value, y: blobCenter.y - Math.sin(angle2) * blobRadius.value };
            const controlPoints = getControlPoints({ b1, b3, nodeCenter }, nodeDisplacement);

            path1.value = `M ${b1.x} ${b1.y} A ${blobRadius.value} ${blobRadius.value} 0 0 1 ${b3.x} ${b3.y}`;
            path2.value = `M ${p3.x} ${p3.y} C ${controlPoints.c1.x} ${controlPoints.c1.y} ${controlPoints.c2.x} ${controlPoints.c2.y} ${b1.x} ${b1.y}`;
            path3.value = `M ${p0.x} ${p0.y} C ${controlPoints.c3.x} ${controlPoints.c3.y} ${controlPoints.c4.x} ${controlPoints.c4.y} ${b3.x} ${b3.y}`;
        },
        [nodeDisplacement]
    );

    return (
        <Canvas style={{ height: CANVAS_SIZE, width: CANVAS_SIZE }}>
            <Group origin={{ x: nodeCenter.x, y: nodeCenter.y }} transform={rotationTransform}>
                {/* CONSTANT PATHS 👇 */}
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p0.x} ${p0.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p1.x} ${p1.y}`}
                    style={"stroke"}
                    color={COLOR}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p1.x} ${p1.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p2.x} ${p2.y}`}
                    style={"stroke"}
                    color={COLOR}></Path>
                <Path
                    strokeWidth={STROKE_WIDTH}
                    path={`M ${p2.x} ${p2.y} A ${RADIUS} ${RADIUS} 0 0 1 ${p3.x} ${p3.y}`}
                    style={"stroke"}
                    color={COLOR}></Path>

                {/* CONSTANT PATHS 👆 */}
                <Path strokeWidth={STROKE_WIDTH} path={path1} style={"stroke"} strokeCap={"round"} color={COLOR}></Path>
                <Path strokeWidth={STROKE_WIDTH} path={path2} style={"stroke"} strokeCap={"round"} color={COLOR}></Path>
                <Path strokeWidth={STROKE_WIDTH} path={path3} style={"stroke"} strokeCap={"round"} color={COLOR}></Path>
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
                return 5;
            case displacement <= 20:
                return 5;
            case displacement <= 30:
                return 5;
            case displacement <= 40:
                return 5;
            case displacement <= 50:
                return 5;
            case displacement <= 71:
                return 4;
            case displacement <= 72:
                return 3;
            case displacement <= 73:
                return 2;
            case displacement <= 74:
                return 1;
            case displacement <= 75:
                return 0;
            default:
                return 0;
        }
    }
}
