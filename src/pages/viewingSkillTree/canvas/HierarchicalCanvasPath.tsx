import { Path, Skia, useComputedValue } from "@shopify/react-native-skia";
import { CIRCLE_SIZE } from "../../../parameters";
import { CartesianCoordinate } from "../../../types";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";

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

        p.moveTo(p1x.current, p1y.current - CIRCLE_SIZE);

        p.cubicTo(
            p1x.current,
            p1y.current - 0.87 * (p1y.current - p2y.current),
            p2x.current,
            p2y.current - 0.43 * (p2y.current - p1y.current),
            p2x.current,
            p2y.current + CIRCLE_SIZE
        );

        return p;
    }, [p1x, p1y, p2x, p2y]);

    if (isRoot) return <></>;

    //eslint-disable-next-line
    return <Path path={path} color={pathColor} style="stroke" strokeWidth={3} />;
}

export default HierarchicalCanvasPath;
