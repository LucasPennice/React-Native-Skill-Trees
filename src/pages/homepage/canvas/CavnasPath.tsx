import { Blur, Path, Skia, SkiaMutableValue, useComputedValue, useSpring } from "@shopify/react-native-skia";
import { CANVAS_SPRING, colors, MAX_OFFSET } from "./parameters";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: { x: number; y: number };
};

function CanvasPath({
    coordinates,
    pathColor,
    isRoot,
    shouldAnimate,
    pathBlurOnInactive,
}: {
    coordinates: pathCoordinates;
    pathColor: string;
    isRoot: boolean;
    shouldAnimate: boolean;
    pathBlurOnInactive: SkiaMutableValue<number>;
}) {
    if (isRoot) return <></>;

    if (shouldAnimate)
        return (
            <AnimatedPath pathColor={pathColor} coordinates={coordinates}>
                <Blur blur={pathBlurOnInactive} />
            </AnimatedPath>
        );

    return (
        <UnanimatedPath pathColor={pathColor} coordinates={coordinates}>
            <Blur blur={pathBlurOnInactive} />
        </UnanimatedPath>
    );
}

function AnimatedPath({ coordinates, children, pathColor }: { coordinates: pathCoordinates; children: JSX.Element; pathColor: string }) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = useSpring(cx, CANVAS_SPRING);
    const p1y = useSpring(cy, CANVAS_SPRING);

    const p2x = useSpring(pathInitialPoint.x, CANVAS_SPRING);
    const p2y = useSpring(pathInitialPoint.y, CANVAS_SPRING);

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

        return p;
    }, [p1x, p1y, p2x, p2y]);

    return (
        <Path path={path} color={pathColor} style="stroke" strokeCap={"round"} strokeWidth={3}>
            {children}
        </Path>
    );
}

function UnanimatedPath({ coordinates, children, pathColor }: { coordinates: pathCoordinates; children: JSX.Element; pathColor: string }) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = cx;
    const p1y = cy;

    const p2x = pathInitialPoint.x;
    const p2y = pathInitialPoint.y;

    const p = Skia.Path.Make();

    p.moveTo(p1x, p1y);

    // mid-point of line:
    var mpx = (p2x + p1x) * 0.5;
    var mpy = (p2y + p1y) * 0.5;

    // angle of perpendicular to line:
    var theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;

    let deltaX = p2x - p1x;

    // distance of control point from mid-point of line:
    var offset = deltaX > MAX_OFFSET ? MAX_OFFSET : deltaX < -MAX_OFFSET ? -MAX_OFFSET : deltaX;

    // location of control point:
    var c1x = mpx + offset * 1.5 * Math.cos(theta);
    var c1y = mpy + offset * 1.5 * Math.sin(theta);

    p.quadTo(c1x, c1y, p2x, p2y);
    return (
        <Path path={p} color={pathColor} style="stroke" strokeCap={"round"} strokeWidth={3}>
            {children}
        </Path>
    );
}
export default CanvasPath;
