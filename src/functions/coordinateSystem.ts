import { CartesianCoordinate, PolarCoordinate } from "../types";

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
    const roundedDistance = parseFloat(pc.distanceToCenter.toFixed(3));

    const roundedAngle = parseFloat(pc.angleInRadians.toFixed(3));

    return { angleInRadians: roundedAngle, distanceToCenter: roundedDistance };
}

export function returnSmallestBetweenAngleAndComplement(angle: number) {
    const complement = angle - 2 * Math.PI;

    if (Math.abs(angle) < Math.abs(complement)) return angle;

    return complement;
}

export function angleBetweenPolarCoordinates(startingCoord: PolarCoordinate, finalCoord: PolarCoordinate) {
    const startingAngleNormalized = returnSmallestBetweenAngleAndComplement(startingCoord.angleInRadians);
    const finalAngleNormalized = returnSmallestBetweenAngleAndComplement(finalCoord.angleInRadians);

    const result = finalAngleNormalized - startingAngleNormalized;

    return result;
}
export function movePointParallelToVector(directionVector: CartesianCoordinate, distanceToMove: number, pointToMove: CartesianCoordinate) {
    const directionVectorModule = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));

    const directionVersor = { x: directionVector.x / directionVectorModule, y: directionVector.y / directionVectorModule };

    const vectorScale = distanceToMove / directionVectorModule;

    const deltaX = directionVersor.x * vectorScale;
    const deltaY = directionVersor.y * vectorScale;

    return { x: pointToMove.x + deltaX, y: pointToMove.y + deltaY };
}
