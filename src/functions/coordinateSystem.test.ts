import { test, expect } from "@jest/globals";
import { angleFromLeftToRightCounterClockWise, cartesianToPositivePolarCoordinates } from "./coordinateSystem";
import { UNCENTERED_ROOT_COORDINATES } from "../parameters";

test("cartesianToPositivePolarCoordinates", () => {
    //0 , 90 , 180 , 270 degrees
    expect(cartesianToPositivePolarCoordinates({ x: 100, y: 0 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 0,
        distanceToCenter: 100,
    });
    expect(cartesianToPositivePolarCoordinates({ x: 0, y: 100 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 1.57079633,
        distanceToCenter: 100,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -100, y: 0 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 3.14159265,
        distanceToCenter: 100,
    });
    expect(cartesianToPositivePolarCoordinates({ x: 0, y: -100 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 4.71238898,
        distanceToCenter: 100,
    });

    // 45 , 135, 225, 315 degrees
    expect(cartesianToPositivePolarCoordinates({ x: 50, y: 50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 0.78539816,
        distanceToCenter: 70.71067812,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -50, y: 50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 2.35619449,
        distanceToCenter: 70.71067812,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -50, y: -50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 3.92699082,
        distanceToCenter: 70.71067812,
    });
    expect(cartesianToPositivePolarCoordinates({ x: 50, y: -50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 5.49778714,
        distanceToCenter: 70.71067812,
    });
});

test("angleFromLeftToRightCounterClockWise", () => {
    const deg30 = 0.524599;
    const deg60 = 1.0472;
    const deg120 = 2.094;
    const deg150 = 2.61799;
    const deg240 = 4.18879;
    const deg260 = 4.53786;
    const deg330 = 5.75959;
    const deg350 = 6.10865;
    //Left in first Q

    expect(angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg60, distanceToCenter: 1 })).toBe(
        0.522601
    );
    //  First quadrant border case
    expect(angleFromLeftToRightCounterClockWise({ angleInRadians: deg60, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })).toBe(
        5.76058431
    );

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg120, distanceToCenter: 1 })
    ).toBe(1.569401);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(3.664191);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(5.234991);

    //Left in second Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(4.71378431);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(0.52399);

    //  Second quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg150, distanceToCenter: 1 }, { angleInRadians: deg120, distanceToCenter: 1 })
    ).toBe(5.75919531);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(2.09479);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(3.66559);

    //Left in third Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(2.61899431);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(4.71238531);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg260, distanceToCenter: 1 })
    ).toBe(0.34907);

    //  Third quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg260, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(5.93411531);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(1.5708);

    //Left in fourth Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(1.04819431);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(3.14158531);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg260, distanceToCenter: 1 })
    ).toBe(5.06145531);

    //  Third quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg350, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(5.93412531);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg350, distanceToCenter: 1 })
    ).toBe(0.34906);
});
