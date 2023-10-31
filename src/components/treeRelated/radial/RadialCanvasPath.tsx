import { Path, PathProps, Skia, SkiaDefaultProps } from "@shopify/react-native-skia";
import { getConstantsRotated } from "../../../functions/coordinateSystem";
import { CIRCLE_SIZE, TIME_TO_REORDER_TREE } from "../../../parameters";
import { CartesianCoordinate, InitialAndFinalCoord, NodeCoordinate, ReactiveNodeCoordinate } from "../../../types";
import { memo, useEffect } from "react";
import { useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { SpringConfig } from "react-native-reanimated/lib/typescript/reanimated2/animation/springUtils";

type PathCoordinates = {
    cx: number;
    cy: number;
    pathInitialPoint: CartesianCoordinate;
};

type Props = {
    coordinates: PathCoordinates;
    isRoot?: boolean;
    nodeCoordinates: NodeCoordinate[];
};

function RadialCanvasPath({ coordinates, isRoot, nodeCoordinates }: Props) {
    const { cx, cy, pathInitialPoint } = coordinates;

    const p1x = cx;
    const p1y = cy;

    const node = { x: p1x, y: p1y };
    const parentOfNodeCoord = { ...pathInitialPoint };
    const rootNodeCoordinates = nodeCoordinates.find((c) => c.level === 0);

    if (!rootNodeCoordinates) return <></>;
    if (isRoot) return <></>;

    const { m, c } = getCurvedPath(rootNodeCoordinates, parentOfNodeCoord, node);

    const p = Skia.Path.Make();
    p.moveTo(m.x, m.y);
    p.cubicTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);

    return <Path path={p} color={"#1C1C1D"} style="stroke" strokeWidth={2} />;
}

type ReactiveCanvasPathProps = {
    rootNode: NodeCoordinate | ReactiveNodeCoordinate;
    parentOfNode: InitialAndFinalCoord;
    node: ReactiveNodeCoordinate;
    springConfig?: SpringConfig;
    cancelPositionAnimation?: boolean;
    pathProps?: SkiaDefaultProps<PathProps, "start" | "end">;
};

export function ReactiveCanvasPath({ rootNode, parentOfNode, node, springConfig, pathProps, cancelPositionAnimation }: ReactiveCanvasPathProps) {
    const isRoot = node.nodeId === rootNode.nodeId;

    const parentOfNodeX = useSharedValue(cancelPositionAnimation ? parentOfNode.finalCoordinates.x : parentOfNode.initialCoordinates.x);
    const parentOfNodeY = useSharedValue(cancelPositionAnimation ? parentOfNode.finalCoordinates.y : parentOfNode.initialCoordinates.y);

    const finalPointX = useSharedValue(cancelPositionAnimation ? node.x : node.initialCoordinates.x);
    const finalPointY = useSharedValue(cancelPositionAnimation ? node.y : node.initialCoordinates.y);

    useEffect(() => {
        if (cancelPositionAnimation) return;

        parentOfNodeX.value = withSpring(parentOfNode.finalCoordinates.x, springConfig ?? { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
        parentOfNodeY.value = withSpring(parentOfNode.finalCoordinates.y, springConfig ?? { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });

        finalPointX.value = withSpring(node.x, springConfig ?? { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
        finalPointY.value = withSpring(node.y, springConfig ?? { duration: TIME_TO_REORDER_TREE, dampingRatio: 0.7 });
    }, []);

    const path = useDerivedValue(() => {
        const p = Skia.Path.Make();

        if (isRoot) return p;

        const { m, c } = UIgetCurvedPath<CartesianCoordinate>(
            rootNode,
            { x: parentOfNodeX.value, y: parentOfNodeY.value },
            { x: finalPointX.value, y: finalPointY.value }
        );

        p.moveTo(m.x, m.y);

        p.cubicTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);

        return p;
    });

    if (isRoot) return <></>;

    return <Path path={path} color={"#1C1C1D"} style="stroke" strokeWidth={2} {...pathProps} />;
}

//This is an horrible and should be refactored if there is a way to have a copy of a function defined on the JS thread for the UI thread

function UIgetCurvedPath<T extends CartesianCoordinate>(rootNode: T, parentOfNodeCoord: T, node: T) {
    "worklet";
    const finalPoint = getFinalPoint(rootNode, node);
    const startingPoint = getStartingPoint(rootNode, parentOfNodeCoord, node);

    const translatedFinalPoint = { x: finalPoint.x - rootNode.x, y: finalPoint.y - rootNode.y };
    const translatedStartingPoint = { x: startingPoint.x - rootNode.x, y: startingPoint.y - rootNode.y };

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

    const translatedAndRotatedCP1 = { x: rotatedCP1X + rootNode.x, y: rotatedCP1Y + rootNode.y };
    const translatedAndRotatedCP2 = { x: rotatedCP2X + rootNode.x, y: rotatedCP2Y + rootNode.y };

    return {
        m: { x: startingPoint.x, y: startingPoint.y },
        c: {
            x1: translatedAndRotatedCP1.x,
            y1: translatedAndRotatedCP1.y,
            x2: translatedAndRotatedCP2.x,
            y2: translatedAndRotatedCP2.y,
            x: finalPoint.x,
            y: finalPoint.y,
        },
    };

    function getConstantsRotated(angleRadians: number, constantsVector: number[]) {
        const r1 = Math.cos(angleRadians) * constantsVector[0] - Math.sin(angleRadians) * constantsVector[1];
        const r2 = Math.sin(angleRadians) * constantsVector[0] + Math.cos(angleRadians) * constantsVector[1];

        return [r1, r2];
    }

    function getStartingPoint<T extends CartesianCoordinate>(rootNode: T, parentOfNodeCoord: T, node: T) {
        const p0 = { ...rootNode };
        const p1 = { ...parentOfNodeCoord };

        const rootNodeEqualsParentOfNode = p0.x === p1.x && p0.y === p1.y;

        if (rootNodeEqualsParentOfNode) return startingPointWhenRootNodeEqualsParent();

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude + CIRCLE_SIZE + 2) / lineLongitude;

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };

        function startingPointWhenRootNodeEqualsParent() {
            if (node.x === p0.x && node.y > p0.y) {
                return { x: p0.x, y: p0.y + CIRCLE_SIZE };
            }
            if (node.x === p0.x && node.y < p0.y) {
                return { x: p0.x, y: p0.y - CIRCLE_SIZE };
            }
            if (node.y === p0.y && node.x > p0.x) {
                return { x: p0.x + CIRCLE_SIZE, y: p0.y };
            }
            if (node.y === p0.y && node.x < p0.x) {
                return { x: p0.x - CIRCLE_SIZE, y: p0.y };
            }

            const deltaX = 0 - node.x;
            const deltaY = 0 - node.y;

            const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

            const cateto1 = Math.pow(p1.x - node.x, 2);
            const cateto2 = Math.pow(p1.y - node.y, 2);

            const lineLongitude = Math.sqrt(cateto1 + cateto2);

            const foo = (lineLongitude - CIRCLE_SIZE - 1) / lineLongitude;

            return { x: node.x + foo * directionVector.x, y: node.y + foo * directionVector.y };
        }
    }

    function getFinalPoint<T extends CartesianCoordinate>(rootNode: T, node: T) {
        const p0 = { ...rootNode };
        const p1 = { ...node };

        const deltaX = 0 - p0.x;
        const deltaY = 0 - p0.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - p0.x, 2);
        const cateto2 = Math.pow(p1.y - p0.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude - CIRCLE_SIZE) / lineLongitude;

        return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };
    }
}

export function getCurvedPath<T extends CartesianCoordinate>(rootNode: T, parentOfNodeCoord: T, node: T) {
    const finalPoint = getFinalPoint(rootNode, node);
    const startingPoint = getStartingPoint(rootNode, parentOfNodeCoord, node);

    const translatedFinalPoint = { x: finalPoint.x - rootNode.x, y: finalPoint.y - rootNode.y };
    const translatedStartingPoint = { x: startingPoint.x - rootNode.x, y: startingPoint.y - rootNode.y };

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

    const translatedAndRotatedCP1 = { x: rotatedCP1X + rootNode.x, y: rotatedCP1Y + rootNode.y };
    const translatedAndRotatedCP2 = { x: rotatedCP2X + rootNode.x, y: rotatedCP2Y + rootNode.y };

    return {
        m: { x: startingPoint.x, y: startingPoint.y },
        c: {
            x1: translatedAndRotatedCP1.x,
            y1: translatedAndRotatedCP1.y,
            x2: translatedAndRotatedCP2.x,
            y2: translatedAndRotatedCP2.y,
            x: finalPoint.x,
            y: finalPoint.y,
        },
    };
}

export function getStartingPoint<T extends CartesianCoordinate>(rootNode: T, parentOfNodeCoord: T, node: T) {
    const p0 = { ...rootNode };
    const p1 = { ...parentOfNodeCoord };

    const rootNodeEqualsParentOfNode = p0.x === p1.x && p0.y === p1.y;

    if (rootNodeEqualsParentOfNode) return startingPointWhenRootNodeEqualsParent();

    const deltaX = 0 - p0.x;
    const deltaY = 0 - p0.y;

    const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

    const cateto1 = Math.pow(p1.x - p0.x, 2);
    const cateto2 = Math.pow(p1.y - p0.y, 2);

    const lineLongitude = Math.sqrt(cateto1 + cateto2);

    const foo = (lineLongitude + CIRCLE_SIZE + 2) / lineLongitude;

    return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };

    function startingPointWhenRootNodeEqualsParent() {
        if (node.x === p0.x && node.y > p0.y) {
            return { x: p0.x, y: p0.y + CIRCLE_SIZE };
        }
        if (node.x === p0.x && node.y < p0.y) {
            return { x: p0.x, y: p0.y - CIRCLE_SIZE };
        }
        if (node.y === p0.y && node.x > p0.x) {
            return { x: p0.x + CIRCLE_SIZE, y: p0.y };
        }
        if (node.y === p0.y && node.x < p0.x) {
            return { x: p0.x - CIRCLE_SIZE, y: p0.y };
        }

        const deltaX = 0 - node.x;
        const deltaY = 0 - node.y;

        const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

        const cateto1 = Math.pow(p1.x - node.x, 2);
        const cateto2 = Math.pow(p1.y - node.y, 2);

        const lineLongitude = Math.sqrt(cateto1 + cateto2);

        const foo = (lineLongitude - CIRCLE_SIZE - 1) / lineLongitude;

        return { x: node.x + foo * directionVector.x, y: node.y + foo * directionVector.y };
    }
}

export function getFinalPoint<T extends CartesianCoordinate>(rootNode: T, node: T) {
    const p0 = { ...rootNode };
    const p1 = { ...node };

    const deltaX = 0 - p0.x;
    const deltaY = 0 - p0.y;

    const directionVector = { x: p1.x + deltaX, y: p1.y + deltaY };

    const cateto1 = Math.pow(p1.x - p0.x, 2);
    const cateto2 = Math.pow(p1.y - p0.y, 2);

    const lineLongitude = Math.sqrt(cateto1 + cateto2);

    const foo = (lineLongitude - CIRCLE_SIZE) / lineLongitude;

    return { x: p0.x + foo * directionVector.x, y: p0.y + foo * directionVector.y };
}

export default memo(RadialCanvasPath, arePropsEqual);

function arePropsEqual(prevProps: Props, nextProps: Props): boolean {
    if (prevProps.coordinates.cx !== nextProps.coordinates.cx) return false;
    if (prevProps.coordinates.cy !== nextProps.coordinates.cy) return false;
    if (prevProps.coordinates.pathInitialPoint.x !== nextProps.coordinates.pathInitialPoint.x) return false;
    if (prevProps.coordinates.pathInitialPoint.y !== nextProps.coordinates.pathInitialPoint.y) return false;

    if (prevProps.isRoot !== nextProps.isRoot) return false;
    if (JSON.stringify(prevProps.nodeCoordinates) !== JSON.stringify(nextProps.nodeCoordinates)) return false;

    return true;
}
