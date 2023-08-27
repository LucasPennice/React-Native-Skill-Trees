import {
    calculateDragAndDropZones,
    centerNodesInCanvas,
    getCanvasDimensions,
    getCoordinatedWithTreeData,
    getNodesCoordinates,
    removeTreeDataFromCoordinate,
} from "../components/treeRelated/coordinateFunctions";
import { ScreenDimentions } from "../redux/slices/screenDimentionsSlice";
import { CartesianCoordinate, InteractiveTreeConfig, PolarCoordinate, Skill, Tree } from "../types";

export function arcToAngleRadians(arcLength: number, circleRadius: number) {
    if (circleRadius === 0) return 0;
    return arcLength / circleRadius;
}

export function polarToCartesianCoordinates(coord: PolarCoordinate) {
    const x = coord.distanceToCenter * Math.cos(coord.angleInRadians);
    const y = coord.distanceToCenter * Math.sin(coord.angleInRadians);

    return { x, y };
}

export function cartesianToPositivePolarCoordinates(point: CartesianCoordinate, center: CartesianCoordinate): PolarCoordinate {
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;

    const angleInRadians = Math.atan2(translatedY, translatedX);

    const distanceToCenter = Math.sqrt(Math.pow(translatedX, 2) + Math.pow(translatedY, 2));

    if (angleInRadians < 0) {
        const result = roundPolarCoordinates({ angleInRadians: angleInRadians + 2 * Math.PI, distanceToCenter });
        return result;
    }

    const result = roundPolarCoordinates({ angleInRadians, distanceToCenter });
    return result;
}

export function roundPolarCoordinates(pc: PolarCoordinate): PolarCoordinate {
    const roundedDistance = round8Decimals(pc.distanceToCenter);

    const roundedAngle = round8Decimals(pc.angleInRadians);

    return { angleInRadians: roundedAngle, distanceToCenter: roundedDistance };
}

export function round8Decimals(n: number) {
    return parseFloat(n.toFixed(8));
}

export function returnSmallestBetweenAngleAndComplement(angle: number) {
    const complement = angle - 2 * Math.PI;

    if (Math.abs(angle) < Math.abs(complement)) return angle;

    return complement;
}

export function angleBetweenPolarCoordinates(startingCoord: PolarCoordinate, finalCoord: PolarCoordinate) {
    if (isBorderCase()) return handleBorderCase();
    // if (startingAngleInQ3 && finalAngleInQ2) return handleBorderCase();

    const startingAngleNormalized = returnSmallestBetweenAngleAndComplement(startingCoord.angleInRadians);
    const finalAngleNormalized = returnSmallestBetweenAngleAndComplement(finalCoord.angleInRadians);

    const result = finalAngleNormalized - startingAngleNormalized;

    return result;

    function isBorderCase() {
        const startingAngleInQ2orQ3 = startingCoord.angleInRadians > Math.PI * 0.5 && startingCoord.angleInRadians < (3 / 2) * Math.PI;
        const finalAngleInQ2orQ3 = finalCoord.angleInRadians > Math.PI * 0.5 && finalCoord.angleInRadians < (3 / 2) * Math.PI;

        return startingAngleInQ2orQ3 && finalAngleInQ2orQ3;
    }

    function handleBorderCase() {
        const translatedStartingAngle = 0;
        const translatedFinalAngle = finalCoord.angleInRadians - startingCoord.angleInRadians;

        const finalAngleNormalized = returnSmallestBetweenAngleAndComplement(translatedFinalAngle);

        return finalAngleNormalized - translatedStartingAngle;
    }
}

export function angleFromLeftToRightCounterClockWise(left: PolarCoordinate, right: PolarCoordinate) {
    let result = 0;

    result = right.angleInRadians - left.angleInRadians;

    if (result < 0) result = result + 2 * Math.PI;

    return round8Decimals(result);
}

export function movePointParallelToVector(directionVector: CartesianCoordinate, distanceToMove: number, pointToMove: CartesianCoordinate) {
    const directionVectorModule = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));

    if (directionVectorModule === 0) throw new Error("cannot divide by 0 at movePointParallelToVector");

    const directionVersor = { x: directionVector.x / directionVectorModule, y: directionVector.y / directionVectorModule };

    const vectorScale = distanceToMove / directionVectorModule;

    const deltaX = directionVersor.x * vectorScale;
    const deltaY = directionVersor.y * vectorScale;

    return { x: pointToMove.x + deltaX, y: pointToMove.y + deltaY };
}

export function getConstantsRotated(angleRadians: number, constantsVector: number[]) {
    const r1 = Math.cos(angleRadians) * constantsVector[0] - Math.sin(angleRadians) * constantsVector[1];
    const r2 = Math.sin(angleRadians) * constantsVector[0] + Math.cos(angleRadians) * constantsVector[1];

    return [r1, r2];
}

export function handleTreeBuild(
    tree: Tree<Skill>,
    screenDimentions: ScreenDimentions,
    renderStyle: InteractiveTreeConfig["renderStyle"],
    showDepthGuides?: boolean
) {
    const coordinatesWithTreeData = getNodesCoordinates(tree, renderStyle);
    //
    const nodeCoordinates = removeTreeDataFromCoordinate(coordinatesWithTreeData);
    const canvasDimentions = getCanvasDimensions(nodeCoordinates, screenDimentions, showDepthGuides);
    const nodeCoordinatesCentered = centerNodesInCanvas(nodeCoordinates, canvasDimentions);
    const dndZoneCoordinates = calculateDragAndDropZones(nodeCoordinatesCentered);
    //
    const centeredCoordinatedWithTreeData = getCoordinatedWithTreeData(coordinatesWithTreeData, nodeCoordinatesCentered);

    return { nodeCoordinatesCentered, centeredCoordinatedWithTreeData, dndZoneCoordinates, coordinatesWithTreeData, canvasDimentions };
}
