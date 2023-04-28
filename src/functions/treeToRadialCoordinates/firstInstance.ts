import { Skill, Tree } from "../../types";
import { arcToAngleRadians, polarToCartesianCoordinates } from "../coordinateSystem";
import { findDistanceBetweenNodesById } from "../extractInformationFromTree";
import { ALLOWED_NODE_SPACING, PolarCoordinate } from "./general";

export function firstIteration(tree: Tree<Skill>, completeTree: Tree<Skill>, currentTreeMod?: PolarCoordinate, childrenIdx?: number) {
    const currentMod: PolarCoordinate = {
        angleInRadians: currentTreeMod ? currentTreeMod.angleInRadians : 0,
        distanceToCenter: currentTreeMod ? currentTreeMod.distanceToCenter : 0,
    };

    //Base Case 👇
    const coord = polarToCartesianCoordinates(currentMod);

    const distance = findDistanceBetweenNodesById(completeTree, tree.data.id);
    const level = distance ? distance - 1 : 0;

    let result: Tree<Skill> = { ...tree, x: coord.x, y: coord.y, level, children: undefined };

    if (!tree.children) return result;

    result.children = [];

    //Recursive Case 👇

    if (tree.isRoot) {
        const anglePerChildren = (2 * Math.PI) / tree.children.length;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const firstLevelChildrenMod = { angleInRadians: 0, distanceToCenter: 1 };
            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, firstLevelChildrenMod, idx);

            if (d) result.children.push(d);
        }
    } else {
        const isFirstNode = childrenIdx === 0;
        const childrenDistanceToCenter = currentMod.distanceToCenter + 1;

        const angleBetweenChildrenInRadians = arcToAngleRadians(ALLOWED_NODE_SPACING, childrenDistanceToCenter);
        const childrenAngleSpan = (tree.children.length - 1) * angleBetweenChildrenInRadians;

        let desiredAngleToCenterChildren = childrenAngleSpan / 2;

        if (isFirstNode === true) result.x = polarToCartesianCoordinates(currentMod).x;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const childrenMod = {
                angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildrenInRadians - desiredAngleToCenterChildren,
                distanceToCenter: childrenDistanceToCenter,
            };

            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, childrenMod, idx);

            if (d) result.children.push(d);
        }
    }

    if (result.children.length === 0) delete result["children"];

    return result;
}
