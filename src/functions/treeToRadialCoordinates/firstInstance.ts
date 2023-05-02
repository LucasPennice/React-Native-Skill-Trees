import { Skill, Tree } from "../../types";
import { arcToAngleRadians, polarToCartesianCoordinates } from "../coordinateSystem";
import { ALLOWED_NODE_SPACING, PolarCoordinate } from "./general";

export function firstIteration(tree: Tree<Skill>, completeTree: Tree<Skill>, currentTreeMod?: PolarCoordinate, childrenIdx?: number) {
    const currentMod: PolarCoordinate = {
        angleInRadians: currentTreeMod ? currentTreeMod.angleInRadians : 0,
        distanceToCenter: currentTreeMod ? currentTreeMod.distanceToCenter : 0,
    };

    //Base Case 👇
    const treeCoord = polarToCartesianCoordinates(currentMod);

    let result: Tree<Skill> = { ...tree, x: treeCoord.x, y: treeCoord.y, level: currentMod.distanceToCenter, children: [] };

    if (!tree.children.length) return result;

    result.children = [];

    //Recursive Case 👇

    if (tree.isRoot) pushLevel1SubTrees();

    if (!tree.isRoot) {
        const isFirstNode = childrenIdx === 0;
        const childrenDistanceToCenter = currentMod.distanceToCenter + 1;

        const angleBetweenChildren = arcToAngleRadians(ALLOWED_NODE_SPACING, childrenDistanceToCenter);
        const childrenAngleSpan = (tree.children.length - 1) * angleBetweenChildren;

        let desiredAngleToCenterChildren = childrenAngleSpan / 2;

        if (isFirstNode === true) result.x = polarToCartesianCoordinates(currentMod).x;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const childrenMod = {
                angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildren - desiredAngleToCenterChildren,
                distanceToCenter: childrenDistanceToCenter,
            };

            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, childrenMod, idx);

            if (d) result.children.push(d);
        }
    }

    return result;

    function pushLevel1SubTrees() {
        if (!tree.children.length) throw "pushLevel1SubTrees";

        for (let idx = 0; idx < tree.children.length; idx++) {
            const firstLevelChildrenMod = { angleInRadians: 0, distanceToCenter: 1 };
            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, firstLevelChildrenMod, idx);

            if (d) result.children!.push(d);
        }
    }
}
