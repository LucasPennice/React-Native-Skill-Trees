import { Path } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Easing, SharedValue, useAnimatedReaction, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { CIRCLE_SIZE, MENU_HIGH_DAMPENING } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: CartesianCoordinate;
};

function HierarchicalCanvasPath({
    coordinates,
    pathDrag,
    isRoot,
    animatePathRetract,
}: {
    coordinates: pathCoordinates;
    isRoot?: boolean;
    animatePathRetract: boolean;
    pathDrag:
        | {
              x: SharedValue<number>;
              y: SharedValue<number>;
          }
        | undefined;
}) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = useSharedValue(cx);
    const p1y = useSharedValue(cy);
    const p2x = useSharedValue(pathInitialPoint.x);
    const p2y = useSharedValue(pathInitialPoint.y);

    const start = useSharedValue(0);

    //ANIMATES PATH RETRACTION FOR THE MAIN NODE THAT IS BEING DRAGGED
    useEffect(() => {
        if (animatePathRetract) {
            start.value = withTiming(1, { duration: 300, easing: Easing.ease });
            return;
        }

        start.value = withTiming(0, { duration: 300, easing: Easing.ease });
    }, [animatePathRetract]);

    useAnimatedReaction(
        () => {
            return [pathDrag, coordinates] as const;
        },
        (arr, _) => {
            const [pathDrag, coordinates] = arr;
            const { cx, cy, pathInitialPoint } = coordinates;

            let updatedP1X = cx;
            let updatedP1Y = cy;
            let updatedP2X = pathInitialPoint.x;
            let updatedP2Y = pathInitialPoint.y;

            if (pathDrag !== undefined) {
                updatedP1X += pathDrag.x.value;
                updatedP1Y += pathDrag.y.value;
                updatedP2X += pathDrag.x.value;
                updatedP2Y += pathDrag.y.value;
            }

            p1x.value = withSpring(updatedP1X, MENU_HIGH_DAMPENING);
            p1y.value = withSpring(updatedP1Y, MENU_HIGH_DAMPENING);
            p2x.value = withSpring(updatedP2X, MENU_HIGH_DAMPENING);
            p2y.value = withSpring(updatedP2Y, MENU_HIGH_DAMPENING);
        },
        [coordinates, pathDrag]
    );

    const path = useDerivedValue(() => {
        let result = "";

        //MOVE INSTRUCTION
        result += `M${p1x.value} ${p1y.value - CIRCLE_SIZE}`;

        //CUBIC TO INSTRUCTION
        result += `C${p1x.value} ${p1y.value - 0.87 * (p1y.value - p2y.value)} ${p2x.value} ${p2y.value - 0.43 * (p2y.value - p1y.value)} ${
            p2x.value
        } ${p2y.value + CIRCLE_SIZE}`;

        return result;
    }, [p1x, p1y, p2x, p2y]);

    if (isRoot) return <></>;

    //eslint-disable-next-line
    return <Path path={path} color={"#1C1C1D"} style="stroke" strokeWidth={2} start={start} />;
}

export default HierarchicalCanvasPath;
