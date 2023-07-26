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
        angleInRadians: 1.571,
        distanceToCenter: 100,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -100, y: 0 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 3.142,
        distanceToCenter: 100,
    });
    expect(cartesianToPositivePolarCoordinates({ x: 0, y: -100 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 4.712,
        distanceToCenter: 100,
    });

    // 45 , 135, 225, 315 degrees
    expect(cartesianToPositivePolarCoordinates({ x: 50, y: 50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 0.785,
        distanceToCenter: 70.711,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -50, y: 50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 2.356,
        distanceToCenter: 70.711,
    });
    expect(cartesianToPositivePolarCoordinates({ x: -50, y: -50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 3.927,
        distanceToCenter: 70.711,
    });
    expect(cartesianToPositivePolarCoordinates({ x: 50, y: -50 }, UNCENTERED_ROOT_COORDINATES)).toStrictEqual({
        angleInRadians: 5.498,
        distanceToCenter: 70.711,
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
        0.523
    );
    //  First quadrant border case
    expect(angleFromLeftToRightCounterClockWise({ angleInRadians: deg60, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })).toBe(
        5.761
    );

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg120, distanceToCenter: 1 })
    ).toBe(1.569);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(3.664);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg30, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(5.235);

    //Left in second Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(4.714);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(0.524);

    //  Second quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg150, distanceToCenter: 1 }, { angleInRadians: deg120, distanceToCenter: 1 })
    ).toBe(5.759);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(2.095);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg120, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(3.666);

    //Left in third Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(2.619);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(4.712);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg260, distanceToCenter: 1 })
    ).toBe(0.349);

    //  Third quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg260, distanceToCenter: 1 }, { angleInRadians: deg240, distanceToCenter: 1 })
    ).toBe(5.934);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg240, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(1.571);

    //Left in fourth Q

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg30, distanceToCenter: 1 })
    ).toBe(1.048);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg150, distanceToCenter: 1 })
    ).toBe(3.142);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg260, distanceToCenter: 1 })
    ).toBe(5.061);

    //  Third quadrant border case
    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg350, distanceToCenter: 1 }, { angleInRadians: deg330, distanceToCenter: 1 })
    ).toBe(5.934);

    expect(
        angleFromLeftToRightCounterClockWise({ angleInRadians: deg330, distanceToCenter: 1 }, { angleInRadians: deg350, distanceToCenter: 1 })
    ).toBe(0.349);
});
