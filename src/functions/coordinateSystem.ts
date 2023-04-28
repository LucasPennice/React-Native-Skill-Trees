import { PolarCoordinate } from "./treeToRadialCoordinates/general";

export function arcToAngleRadians(arcLength: number, circleRadius: number) {
    if (circleRadius === 0) return 0;
    return arcLength / circleRadius;
}

export function polarToCartesianCoordinates(coord: PolarCoordinate) {
    const x = coord.distanceToCenter * Math.cos(coord.angleInRadians);
    const y = coord.distanceToCenter * Math.sin(coord.angleInRadians);

    return { x, y };
}

export function cartesianToPositivePolarCoordinates(point: { x: number; y: number }, center: { x: number; y: number }): PolarCoordinate {
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
    const roundedDistance = Math.round(pc.distanceToCenter);

    const roundedAngle = parseFloat(pc.angleInRadians.toFixed(5));

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
