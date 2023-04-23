import { Skill, Tree } from "../types";
import { findDistanceBetweenNodesById } from "./extractInformationFromTree";
import { Coordinates, treeToCoordArray } from "./treeToHierarchicalCoordinates";

export function PlotCircularTree(completeTree: Tree<Skill>) {
    let result: Tree<Skill> = { ...completeTree };

    result = firstIteration(completeTree);

    let treeCoordinates: Coordinates[] = [];
    treeToCoordArray(result, treeCoordinates);

    console.log(treeCoordinates);

    const smallestXCoordinate = Math.min(...treeCoordinates.map((c) => c.x));
    const smallestYCoordinate = Math.min(...treeCoordinates.map((c) => c.y));

    if (smallestXCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, x: c.x + Math.abs(smallestXCoordinate) };
        });
    if (smallestYCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, y: c.y + Math.abs(smallestYCoordinate) };
        });

    return treeCoordinates;

    function firstIteration(tree: Tree<Skill>, currentTreeMod?: { angleInRadians: number; distanceToCenter: number }, childrenIdx?: number) {
        const currentMod = {
            angleInRadians: currentTreeMod ? currentTreeMod.angleInRadians : 0,
            distanceToCenter: currentTreeMod ? currentTreeMod.distanceToCenter : 0,
        };

        //Base Case 👇
        const coord = radialToCartesianCoordinates(currentMod.angleInRadians, currentMod.distanceToCenter);

        const distance = findDistanceBetweenNodesById(completeTree, tree.data.id);
        const level = distance ? distance - 1 : 0;

        let result: Tree<Skill> = { ...tree, x: coord.x, y: coord.y, level, children: undefined };

        if (!tree.children) return result;

        result.children = [];

        //Recursive Case 👇

        if (tree.isRoot) {
            const anglePerChildren = (2 * Math.PI) / tree.children.length;

            for (let idx = 0; idx < tree.children.length; idx++) {
                const firstLevelChildrenMod = { angleInRadians: anglePerChildren * idx, distanceToCenter: 1 };
                const element = tree.children[idx];

                const d = firstIteration(element, firstLevelChildrenMod, idx);

                if (d) result.children.push(d);
            }
        } else {
            const isFirstNode = childrenIdx === 0;
            const childrenDistanceToCenter = currentMod.distanceToCenter + 1;

            const angleBetweenChildrenInRadians = arcToAngleRadians(1, childrenDistanceToCenter);
            const childrenAngleSpan = (tree.children.length - 1) * angleBetweenChildrenInRadians;

            let desiredAngleToCenterChildren = childrenAngleSpan / 2;

            if (isFirstNode === true) result.x = radialToCartesianCoordinates(currentMod.angleInRadians, currentMod.distanceToCenter).x;

            for (let idx = 0; idx < tree.children.length; idx++) {
                const childrenMod = {
                    angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildrenInRadians - desiredAngleToCenterChildren,
                    distanceToCenter: childrenDistanceToCenter,
                };

                const element = tree.children[idx];

                const d = firstIteration(element, childrenMod, idx);

                if (d) result.children.push(d);
            }
        }

        if (result.children.length === 0) delete result["children"];

        return result;
    }
}

function arcToAngleRadians(arcLength: number, circleRadius: number) {
    if (circleRadius === 0) return 0;
    return arcLength / circleRadius;
}

function radialToCartesianCoordinates(angleInRadians: number, distanceToCenter: number) {
    const x = distanceToCenter * Math.cos(angleInRadians);
    const y = distanceToCenter * Math.sin(angleInRadians);

    return { x, y };
}
