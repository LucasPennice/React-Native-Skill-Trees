import { Path, Skia } from "@shopify/react-native-skia";
import { useDerivedValue, withSpring } from "react-native-reanimated";
import { CANVAS_SPRING, CIRCLE_SIZE } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";

type PathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: CartesianCoordinate;
};

type Props = { coordinates: PathCoordinates; isRoot?: boolean };

function useSharedValuesFromPoints(coordinates: PathCoordinates) {
    const p1x = useDerivedValue(() => {
        return withSpring(coordinates.cx, CANVAS_SPRING);
    });
    const p1y = useDerivedValue(() => {
        return withSpring(coordinates.cy, CANVAS_SPRING);
    });
    const p2x = useDerivedValue(() => {
        return withSpring(coordinates.pathInitialPoint.x, CANVAS_SPRING);
    });
    const p2y = useDerivedValue(() => {
        return withSpring(coordinates.pathInitialPoint.y, CANVAS_SPRING);
    });

    return { p1x, p1y, p2x, p2y };
}

function HierarchicalReactiveCanvasPath({ coordinates, isRoot }: Props) {
    const { p1x, p1y, p2x, p2y } = useSharedValuesFromPoints(coordinates);

    const path = Skia.Path.Make();
    path.moveTo(p1x.value, p1y.value - CIRCLE_SIZE);

    path.cubicTo(
        p1x.value,
        p1y.value - 0.87 * (p1y.value - p2y.value),
        p2x.value,
        p2y.value - 0.43 * (p2y.value - p1y.value),
        p2x.value,
        p2y.value + CIRCLE_SIZE
    );

    if (isRoot) return <></>;

    //eslint-disable-next-line
    return <Path path={path} color={"#1C1C1D"} style="stroke" strokeWidth={2} />;
}

export default HierarchicalReactiveCanvasPath;
