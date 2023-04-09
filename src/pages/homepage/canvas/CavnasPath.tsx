import { Blur, Path, Skia, SkiaMutableValue, useComputedValue } from "@shopify/react-native-skia";
import { MAX_OFFSET } from "./parameters";
import useAnimateSkiaValue from "./hooks/useAnimateSkiaValue";
import { svgPathProperties } from "svg-path-properties";
import { CIRCLE_SIZE } from "./parameters";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: { x: number; y: number };
};

function CanvasPath({
    coordinates,
    pathColor,
    isRoot,
    pathBlurOnInactive,
}: {
    coordinates: pathCoordinates;
    pathColor: string;
    isRoot?: boolean;
    pathBlurOnInactive?: SkiaMutableValue<number>;
}) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = useAnimateSkiaValue({ initialValue: cx, stateToAnimate: cx });
    const p1y = useAnimateSkiaValue({ initialValue: cy, stateToAnimate: cy });
    const p2x = useAnimateSkiaValue({ initialValue: pathInitialPoint.x, stateToAnimate: pathInitialPoint.x });
    const p2y = useAnimateSkiaValue({ initialValue: pathInitialPoint.y, stateToAnimate: pathInitialPoint.y });

    const path = useComputedValue(() => {
        const p = Skia.Path.Make();

        p.moveTo(p1x.current, p1y.current);

        // mid-point of line:
        var mpx = (p2x.current + p1x.current) * 0.5;
        var mpy = (p2y.current + p1y.current) * 0.5;

        // angle of perpendicular to line:
        var theta = Math.atan2(p2y.current - p1y.current, p2x.current - p1x.current) - Math.PI / 2;

        let deltaX = p2x.current - p1x.current;

        // distance of control point from mid-point of line:
        var offset = deltaX > MAX_OFFSET ? MAX_OFFSET : deltaX < -MAX_OFFSET ? -MAX_OFFSET : deltaX;

        // location of control point:
        var c1x = mpx + offset * 1.5 * Math.cos(theta);
        var c1y = mpy + offset * 1.5 * Math.sin(theta);

        p.quadTo(c1x, c1y, p2x.current, p2y.current);

        const pathString = p.toSVGString();
        const properties = new svgPathProperties(pathString);
        const pathLength = properties.getTotalLength();

        const newLength = pathLength - CIRCLE_SIZE - 2;

        const startTrim = newLength / pathLength;

        //The trim is slighly larger if the path is completely vertical
        const endTrim = 1 - (newLength - 1) / pathLength;

        p.trim(startTrim, 1, true);

        p.trim(0, endTrim, true);

        p.simplify();
        return p;
    }, [p1x, p1y, p2x, p2y]);

    if (isRoot) return <></>;

    return (
        <Path path={path} color={pathColor} style="stroke" strokeWidth={3}>
            {pathBlurOnInactive && <Blur blur={pathBlurOnInactive} />}
        </Path>
    );
}

export default CanvasPath;
