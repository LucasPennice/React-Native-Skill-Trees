import { Path, Skia } from "@shopify/react-native-skia";
import { getConstantsRotated } from "../../../functions/coordinateSystem";
import { CIRCLE_SIZE } from "../../../parameters";
import { CartesianCoordinate, NodeCoordinate } from "../../../types";

type pathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: CartesianCoordinate;
};

function RadialCanvasPath({
    coordinates,
    pathColor,
    isRoot,
    nodeCoordinatesCentered,
}: {
    coordinates: pathCoordinates;
    pathColor: string;
    isRoot?: boolean;
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

    const { c1, c2, p: res } = getCurvedPath(rootNodeCoordinates, parentOfNodeCoord, centerOfNode);
    if (res.toSVGString().includes("nan")) {
    }

    const cp1 = Skia.Path.Make();
    cp1.moveTo(c1.x, c1.y);
    cp1.addCircle(c1.x, c1.y, 2);

    const cp2 = Skia.Path.Make();
    cp2.moveTo(c2.x, c2.y);
    cp2.addCircle(c2.x, c2.y, 2);

    //eslint-disable-next-line
    return <Path path={res} color={"#1C1C1D"} style="stroke" strokeWidth={2} />;
}

function getCurvedPath(rootCoordinates: NodeCoordinate, parentOfNodeCoord: CartesianCoordinate, centerOfNode: CartesianCoordinate) {
    const finalPoint = getFinalPoint(rootCoordinates, centerOfNode);
    const startingPoint = getStartingPoint(rootCoordinates, parentOfNodeCoord);

    const translatedFinalPoint = { x: finalPoint.x - rootCoordinates.x, y: finalPoint.y - rootCoordinates.y };
    const translatedStartingPoint = { x: startingPoint.x - rootCoordinates.x, y: startingPoint.y - rootCoordinates.y };

    const tentativeVectorAngle = Math.atan2(translatedFinalPoint.y, translatedFinalPoint.x);
    const vectorAngle = tentativeVectorAngle < 0 ? tentativeVectorAngle + 2 * Math.PI : tentativeVectorAngle;
    const rotationAngle = (3 * Math.PI) / 2 - vectorAngle;

    const [rotatedAndTranslatedStartingPointX, rotatedAndTranslatedStartingPointY] = getConstantsRotated(rotationAngle, [
        translatedStartingPoint.x,
        translatedStartingPoint.y,
    ]);
    const [rotatedAndTranslatedFinalPointX, rotatedAndTranslatedFinalPointY] = getConstantsRotated(rotationAngle, [
        translatedFinalPoint.x,
        translatedFinalPoint.y,
    ]);

    const cpx1 = rotatedAndTranslatedFinalPointX - 0.83 * (rotatedAndTranslatedFinalPointX - rotatedAndTranslatedStartingPointX);
    const cpy1 = rotatedAndTranslatedFinalPointY - 0.23 * (rotatedAndTranslatedFinalPointY - rotatedAndTranslatedStartingPointY);
    const cpx2 = rotatedAndTranslatedStartingPointX - 1 * (rotatedAndTranslatedStartingPointX - rotatedAndTranslatedFinalPointX);
    const cpy2 = rotatedAndTranslatedStartingPointY + 0.4 * (rotatedAndTranslatedFinalPointY - rotatedAndTranslatedStartingPointY);

    const [rotatedCP1X, rotatedCP1Y] = getConstantsRotated(-rotationAngle, [cpx1, cpy1]);
    const [rotatedCP2X, rotatedCP2Y] = getConstantsRotated(-rotationAngle, [cpx2, cpy2]);

    const translatedAndRotatedCP1 = { x: rotatedCP1X + rootCoordinates.x, y: rotatedCP1Y + rootCoordinates.y };
    const translatedAndRotatedCP2 = { x: rotatedCP2X + rootCoordinates.x, y: rotatedCP2Y + rootCoordinates.y };

    const p = Skia.Path.Make();
    p.moveTo(startingPoint.x, startingPoint.y);
    p.cubicTo(translatedAndRotatedCP1.x, translatedAndRotatedCP1.y, translatedAndRotatedCP2.x, translatedAndRotatedCP2.y, finalPoint.x, finalPoint.y);

    return { p, c1: { ...translatedAndRotatedCP1 }, c2: { ...translatedAndRotatedCP2 } };

    function getFinalPoint(rootCoordinates: NodeCoordinate, centerOfNode: CartesianCoordinate) {
        const p0 = { ...rootCoordinates };
        const p1 = { ...centerOfNode };

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude - CIRCLE_SIZE) / lineLongitude;

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };
    }

    function getStartingPoint(rootCoordinates: NodeCoordinate, parentOfNodeCoord: CartesianCoordinate) {
        const p0 = { ...rootCoordinates };
        const p1 = { ...parentOfNodeCoord };

        const rootNodeEqualsParentOfNode = p0.x === p1.x && p0.y === p1.y;

        if (rootNodeEqualsParentOfNode) return startingPointWhenRootNodeEqualsParent();

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude + CIRCLE_SIZE) / lineLongitude;

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };

        function startingPointWhenRootNodeEqualsParent() {
            if (centerOfNode.x === p0.x && centerOfNode.y > p0.y) {
                return { x: p0.x, y: p0.y + CIRCLE_SIZE };
            }
            if (centerOfNode.x === p0.x && centerOfNode.y < p0.y) {
                return { x: p0.x, y: p0.y - CIRCLE_SIZE };
            }
            if (centerOfNode.y === p0.y && centerOfNode.x > p0.x) {
                return { x: p0.x + CIRCLE_SIZE, y: p0.y };
            }
            if (centerOfNode.y === p0.y && centerOfNode.x < p0.x) {
                return { x: p0.x - CIRCLE_SIZE, y: p0.y };
            }

            const deltaX = 0 - centerOfNode.x;
            const deltaY = 0 - centerOfNode.y;

            const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

            const cateto1 = Math.pow(p1.x - centerOfNode.x, 2);
            const cateto2 = Math.pow(p1.y - centerOfNode.y, 2);

            const lineLongitude = Math.sqrt(cateto1 + cateto2);

            const foo = (lineLongitude - CIRCLE_SIZE) / lineLongitude;

            return { x: centerOfNode.x + foo * directionVector.x, y: centerOfNode.y + foo * directionVector.y };
        }
    }
}

export default RadialCanvasPath;
