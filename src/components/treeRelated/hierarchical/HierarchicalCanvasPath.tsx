import { Path, Skia } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { CIRCLE_SIZE, TIME_TO_REORDER_TREE } from "../../../parameters";
import { InitialAndFinalCoord } from "../../../types";

type Props = { pathFinalPoint: InitialAndFinalCoord; isRoot?: boolean; pathInitialPoint: InitialAndFinalCoord; color: string };

function HierarchicalReactiveCanvasPath({ pathFinalPoint, pathInitialPoint, isRoot, color }: Props) {
    const initialPointX = useSharedValue(pathInitialPoint.initialCoordinates.x);
    const initialPointY = useSharedValue(pathInitialPoint.initialCoordinates.y);

    const finalPointX = useSharedValue(pathFinalPoint.initialCoordinates.x);
    const finalPointY = useSharedValue(pathFinalPoint.initialCoordinates.y);

    useEffect(() => {
        initialPointX.value = withSpring(pathInitialPoint.finalCoordinates.x, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
        initialPointY.value = withSpring(pathInitialPoint.finalCoordinates.y, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });

        finalPointX.value = withSpring(pathFinalPoint.finalCoordinates.x, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
        finalPointY.value = withSpring(pathFinalPoint.finalCoordinates.y, { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
    }, []);

    const path = useDerivedValue(() => {
        const path = Skia.Path.Make();

        path.moveTo(finalPointX.value, finalPointY.value - CIRCLE_SIZE);

        path.cubicTo(
            finalPointX.value,
            finalPointY.value - 0.87 * (finalPointY.value - initialPointY.value),
            initialPointX.value,
            initialPointY.value - 0.43 * (initialPointY.value - finalPointY.value),
            initialPointX.value,
            initialPointY.value + CIRCLE_SIZE
        );

        return path;
    });

    if (isRoot) return <></>;

    //eslint-disable-next-line
    return <Path path={path} color={color} style="stroke" strokeWidth={2} />;
}

export default HierarchicalReactiveCanvasPath;
