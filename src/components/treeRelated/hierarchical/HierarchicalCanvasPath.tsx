import { Path, Skia, useComputedValue } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";
import useAnimateSkiaValue from "../hooks/useAnimateSkiaValue";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: CartesianCoordinate;
};

function HierarchicalCanvasPath({ coordinates, pathColor, isRoot }: { coordinates: pathCoordinates; pathColor: string; isRoot?: boolean }) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    const p1y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });
    const p2x = useAnimateSkiaValue({ initialValue: pathInitialPoint.x, stateToAnimate: pathInitialPoint.x });
    const p2y = useAnimateSkiaValue({ initialValue: pathInitialPoint.y, stateToAnimate: pathInitialPoint.y });

    const path = useComputedValue(() => {
        const p = Skia.Path.Make();

        p.moveTo(p1x.value, p1y.value - CIRCLE_SIZE);

        p.cubicTo(
            p1x.value,
            p1y.value - 0.87 * (p1y.value - p2y.value),
            p2x.value,
            p2y.value - 0.43 * (p2y.value - p1y.value),
            p2x.value,
            p2y.value + CIRCLE_SIZE
        );

        return p;
    }, [p1x, p1y, p2x, p2y]);

    if (isRoot) return <></>;

    //eslint-disable-next-line
    return <Path path={path} color={"#1C1C1D"} style="stroke" strokeWidth={2} />;
}

export default HierarchicalCanvasPath;
