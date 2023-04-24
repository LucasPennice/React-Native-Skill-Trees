import { Path, Skia, SkiaMutableValue } from "@shopify/react-native-skia";
import { NodeCoordinate } from "../../../types";
import { CIRCLE_SIZE } from "../../../parameters";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: { x: number; y: number };
};

function RadialCanvasPath({
    coordinates,
    pathColor,
    isRoot,
    pathBlurOnInactive,
    nodeCoordinatesCentered,
}: {
    coordinates: pathCoordinates;
    pathColor: string;
    isRoot?: boolean;
    pathBlurOnInactive?: SkiaMutableValue<number>;
    nodeCoordinatesCentered: NodeCoordinate[];
}) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = cx;
    const p1y = cy;

    const centerOfNode = { x: p1x, y: p1y };
    const parentOfNodeCoord = { ...pathInitialPoint };
    const rootNodeCoordinates = nodeCoordinatesCentered.find((c) => c.level === 0);

    if (!rootNodeCoordinates) return <></>;
    if (isRoot) return <></>;

    const parentToRootAngle = getParentNodeToRootAngle();

    const p = Skia.Path.Make();

    const p1 = getP1();
    const p2 = getP2();

    p.moveTo(p1.x, p1.y);

    //Me parece que me tengo que armar una funcion que haga que las constantes estas dependan de la rotacion

    const cpx1 = p1.x - Math.cos(parentToRootAngle) * 0.87 * (p1.x - p2.x);
    const cpy1 = p1.y - Math.sin(parentToRootAngle) * 0.87 * (p1.y - p2.y);
    const cpx2 = p2.x - Math.cos(parentToRootAngle) * 0.43 * (p2.x - p1.x);
    const cpy2 = p2.y - Math.sin(parentToRootAngle) * 0.43 * (p2.y - p1.y);
    p.cubicTo(cpx1, cpy1, cpx2, cpy2, p2.x, p2.y);

    const cp1 = Skia.Path.Make();
    cp1.moveTo(cpx1, cpy1);
    cp1.addCircle(cpx1, cpy1, 2);

    const cp2 = Skia.Path.Make();
    cp2.moveTo(cpx2, cpy2);
    cp2.addCircle(cpx2, cpy2, 2);

    return (
        <>
            {/* <Path path={cp2} color="yellow" /> */}
            {/* <Path path={cp1} color="white" /> */}
            <Path path={p} color={pathColor} style="stroke" strokeWidth={1} opacity={pathBlurOnInactive ?? 1} />
        </>
    );

    function getP1() {
        const p0 = rootNodeCoordinates!;
        const p1 = centerOfNode;

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude - CIRCLE_SIZE) / lineLongitude;

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };
    }

    function getP2() {
        const p0 = rootNodeCoordinates!;
        const p1 = parentOfNodeCoord;

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude + CIRCLE_SIZE) / lineLongitude;

        const rootNodeEqualsParentOfNode = p0.x === p1.x && p0.y === p1.y;

        if (rootNodeEqualsParentOfNode && centerOfNode.x === p0.x && centerOfNode.y > p0.y) {
            return { x: p0.x, y: p0.y + CIRCLE_SIZE };
        }
        if (rootNodeEqualsParentOfNode && centerOfNode.x === p0.x && centerOfNode.y < p0.y) {
            return { x: p0.x, y: p0.y - CIRCLE_SIZE };
        }
        if (rootNodeEqualsParentOfNode && centerOfNode.y === p0.y && centerOfNode.x > p0.x) {
            return { x: p0.x + CIRCLE_SIZE, y: p0.y };
        }
        if (rootNodeEqualsParentOfNode && centerOfNode.y === p0.y && centerOfNode.x < p0.x) {
            return { x: p0.x - CIRCLE_SIZE, y: p0.y };
        }

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };
    }

    function getParentNodeToRootAngle() {
        const deltaX = rootNodeCoordinates!.x - parentOfNodeCoord.x;
        const deltaY = rootNodeCoordinates!.y - parentOfNodeCoord.y;

        if (deltaX === 0) return Math.PI / 2;
        if (deltaX === 0) return 0;

        const angle = Math.atan(deltaY / deltaX);

        return angle;
    }
}

export default RadialCanvasPath;
