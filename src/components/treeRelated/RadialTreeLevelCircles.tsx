import { Circle, DashPathEffect } from "@shopify/react-native-skia";
import { CoordinatesWithTreeData } from "../../types";
import { cartesianToPositivePolarCoordinates } from "../../functions/coordinateSystem";

function RadialTreeLevelCircles({ nodeCoordinates }: { nodeCoordinates: CoordinatesWithTreeData[] }) {
    const rootNode = nodeCoordinates.find((n) => n.level === 0);

    if (!rootNode) return <></>;

    const levelDistances = getLevelDistances();

    const rootNodeCoord = { x: rootNode.x, y: rootNode.y };

    return (
        <>
            {levelDistances.map((r, idx) => {
                return (
                    // eslint-disable-next-line
                    <Circle key={idx} cx={rootNodeCoord.x} cy={rootNodeCoord.y} r={r} color="gray" style={"stroke"} opacity={0.7}>
                        <DashPathEffect intervals={[10, 10]} />
                    </Circle>
                );
            })}
        </>
    );

    function getLevelDistances() {
        const result: number[] = [];

        for (let i = 0; i < nodeCoordinates.length; i++) {
            const element = nodeCoordinates[i];

            if (result[element.level] === undefined) {
                const polarCoord = cartesianToPositivePolarCoordinates({ x: element.x, y: element.y }, { x: rootNode!.x, y: rootNode!.y });

                result[element.level] = polarCoord.distanceToCenter;
            }
        }

        return result;
    }
}

export default RadialTreeLevelCircles;
