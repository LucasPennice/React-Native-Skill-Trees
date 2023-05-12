import { ALLOWED_NODE_SPACING } from "../../parameters";
import { PolarCoordinate, Skill, Tree } from "../../types";
import { arcToAngleRadians, polarToCartesianCoordinates } from "../coordinateSystem";
import { DistanceToCenterPerLevel } from "./overlap";

type RadialTreeMod = PolarCoordinate & { level: number };

const DEFAULT_CURRENT_TREE_MOD: RadialTreeMod = { angleInRadians: 0, distanceToCenter: 0, level: 0 };

export function firstIteration(
    tree: Tree<Skill>,
    completeTree: Tree<Skill>,
    distanceToCenterPerLevel: DistanceToCenterPerLevel,
    currentTreeMod?: RadialTreeMod,
    childrenIdx?: number
) {
    const currentMod: RadialTreeMod = currentTreeMod !== undefined ? currentTreeMod : DEFAULT_CURRENT_TREE_MOD;

    //Base Case 👇
    const treeCoord = polarToCartesianCoordinates(currentMod);

    let result: Tree<Skill> = { ...tree, x: treeCoord.x, y: treeCoord.y, level: currentMod.level, children: [] };

    if (!tree.children.length) return result;

    result.children = [];

    //Recursive Case 👇

    if (tree.isRoot) pushLevel1SubTrees();

    if (!tree.isRoot) {
        const isFirstNode = childrenIdx === 0;
        const childrenDistanceToCenter = distanceToCenterPerLevel[currentMod.level + 1];

        const angleBetweenChildren = arcToAngleRadians(ALLOWED_NODE_SPACING, childrenDistanceToCenter);
        const childrenAngleSpan = (tree.children.length - 1) * angleBetweenChildren;

        let desiredAngleToCenterChildren = childrenAngleSpan / 2;

        if (isFirstNode === true) result.x = polarToCartesianCoordinates(currentMod).x;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const childrenMod: RadialTreeMod = {
                angleInRadians: currentMod.angleInRadians + idx * angleBetweenChildren - desiredAngleToCenterChildren,
                distanceToCenter: childrenDistanceToCenter,
                level: currentMod.level + 1,
            };

            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, distanceToCenterPerLevel, childrenMod, idx);

            if (d) result.children.push(d);
        }
    }

    return result;

    function pushLevel1SubTrees() {
        if (!tree.children.length) throw "pushLevel1SubTrees";

        for (let idx = 0; idx < tree.children.length; idx++) {
            const firstLevelChildrenMod: RadialTreeMod = { angleInRadians: 0, distanceToCenter: distanceToCenterPerLevel[1], level: 1 };
            const element = tree.children[idx];

            const d = firstIteration(element, completeTree, distanceToCenterPerLevel, firstLevelChildrenMod, idx);

            if (d) result.children!.push(d);
        }
    }
}
