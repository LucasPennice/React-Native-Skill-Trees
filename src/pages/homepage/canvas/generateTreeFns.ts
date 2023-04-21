import { Skill, Tree } from "../../../types";
import { findDistanceBetweenNodesById, findLowestCommonAncestorIdOfNodes, returnPathFromRootToNode } from "../treeFunctions";

export type Coordinates = { x: number; y: number; id: string; level: number; parentId: string | null; name: string };
type Contour = { leftNode: { coord: number; id: string }; rightNode: { coord: number; id: string } };

export const PlotTreeReingoldTiltfordAlgorithm = (completeTree: Tree<Skill>) => {
    let result: Tree<Skill>;

    result = firstIteration(completeTree);

    result = handleOverlap(result);

    let treeCoordinates: Coordinates[] = [];
    treeToCoordArray(result, treeCoordinates);

    const smallestXCoordinate = Math.min(...treeCoordinates.map((c) => c.x));

    if (smallestXCoordinate < 0)
        treeCoordinates = treeCoordinates.map((c) => {
            return { ...c, x: c.x + Math.abs(smallestXCoordinate) };
        });

    return treeCoordinates;

    function firstIteration(tree: Tree<Skill>, currentTreeMod?: number, childrenIdx?: number) {
        //Base Case 👇

        let x = (childrenIdx ?? 0) + (currentTreeMod ?? 0);
        let desiredXValueToCenterChildren = 0;
        const isFirstNode = childrenIdx === 0;

        const distance = findDistanceBetweenNodesById(completeTree, tree.data.id);
        const level = distance ? distance - 1 : 0;

        const result: Tree<Skill> = { ...tree, x, y: level, level, children: undefined };

        if (!tree.children) return result;

        result.children = [];

        //Recursive Case 👇

        desiredXValueToCenterChildren = (tree.children.length - 1) / 2;
        const childrenMod = x - desiredXValueToCenterChildren;
        if (isFirstNode === true) x = currentTreeMod ?? 0;

        for (let idx = 0; idx < tree.children.length; idx++) {
            const element = tree.children[idx];

            const d = firstIteration(element, childrenMod, idx);

            if (d) result.children.push(d);
        }

        if (result.children.length === 0) delete result["children"];

        return result;
    }

    function treeToCoordArray(tree: Tree<Skill>, result: Coordinates[]) {
        // Recursive Case 👇
        if (tree.children) {
            for (let i = 0; i < tree.children.length; i++) {
                const element = tree.children[i];
                treeToCoordArray(element, result);
            }
        }

        // Non Recursive Case 👇

        result.push({
            id: tree.data.id,
            name: tree.data.name,
            x: tree.x,
            y: tree.y,
            level: tree.level,
            parentId: tree.parentId ?? null,
        });
    }

    function handleOverlap(tree: Tree<Skill>) {
        let overlapInTree = true;
        let loopAvoider = -1;

        let result: Tree<Skill> = { ...tree };

        const coordArray: Coordinates[] = [];
        treeToCoordArray(result, coordArray);
        const treeDepths = coordArray.map((t) => t.level);
        const treeDepth = Math.max(...treeDepths);

        while (overlapInTree && loopAvoider <= treeDepth) {
            const overlap = checkForOverlap(result);

            if (overlap !== undefined) {
                const treesToShift = getTreesToShift(result, overlap.nodesInConflict);
                result = shiftNodes(result, treesToShift, overlap.biggestOverlap);
            } else {
                overlapInTree = false;
            }
            loopAvoider++;
        }

        result = centerRoot(result);

        return result;

        function centerRoot(tree: Tree<Skill>) {
            if (!tree.children) return tree;

            const leftChildrenCoord = tree.children[0].x;
            const rightChildrenCoord = tree.children[tree.children.length - 1].x;

            return { ...tree, x: leftChildrenCoord + (rightChildrenCoord - leftChildrenCoord) / 2 } as Tree<Skill>;
        }
    }

    type OverlapCheck = undefined | { biggestOverlap: number; nodesInConflict: [string, string] };

    function checkForOverlap(tree: Tree<Skill>): OverlapCheck {
        const contourByLevel: { [key: string]: Contour[] } = {};
        getTreeContourByLevel(tree, contourByLevel);

        let result: OverlapCheck = undefined;

        const treeLevels = Object.keys(contourByLevel);

        treeLevels.forEach((key) => {
            const levelContour = contourByLevel[key];

            const levelBiggestOverlap = getLevelBiggestOverlap(levelContour);

            const updateBiggestTreeOverlap =
                levelBiggestOverlap !== undefined && (result === undefined || levelBiggestOverlap.biggestOverlap >= result.biggestOverlap);

            if (updateBiggestTreeOverlap) result = { ...levelBiggestOverlap };
        });

        return result as OverlapCheck;
    }

    function getLevelBiggestOverlap(levelContour: Contour[]) {
        let result: OverlapCheck;

        for (let idx = 0; idx < levelContour.length; idx++) {
            const isOnLastContour = idx === levelContour.length - 1;

            //We return on the last item because we compare the current contour with the next one, and the next contour doesn't exist on this iteration
            if (isOnLastContour) return result;

            const currentContour = levelContour[idx];
            const nextContour = levelContour[idx + 1];

            //I define two nodes perfectly overlapping as poor spacing and not overlap
            const overlapBetweenThisAndNextContour = currentContour.rightNode.coord > nextContour.leftNode.coord;
            const overlapDistance = Math.abs(currentContour.rightNode.coord - nextContour.leftNode.coord);

            const overlap = overlapBetweenThisAndNextContour && (result === undefined || result.biggestOverlap < overlapDistance);

            const nodeSpacing = nextContour.leftNode.coord - currentContour.rightNode.coord;

            const poorSpacing = !overlap && nodeSpacing < 1 && (result === undefined || result.biggestOverlap < nodeSpacing);

            if (overlap) result = { biggestOverlap: overlapDistance, nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id] };

            if (poorSpacing) result = { biggestOverlap: 1 - nodeSpacing, nodesInConflict: [currentContour.rightNode.id, nextContour.leftNode.id] };
        }

        return result;
    }

    function getTreeContourByLevel(tree: Tree<Skill>, result: { [key: string]: Contour[] }) {
        //Base Case 👇

        if (!tree.children) return;

        //Recursive Case 👇

        const leftmostNode = tree.children[0];
        const rightmostNode = tree.children[tree.children.length - 1];

        const key = `${tree.level}`;

        const contourToAppend: Contour = {
            leftNode: { coord: leftmostNode.x, id: leftmostNode.data.id },
            rightNode: { coord: rightmostNode.x, id: rightmostNode.data.id },
        };

        if (result[key]) result[key] = [...result[key], contourToAppend];
        if (!result[key]) result[key] = [contourToAppend];

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            getTreeContourByLevel(element, result);
        }
    }

    function getTreesToShift(result: Tree<Skill>, nodesInConflict: [string, string]) {
        const treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] } = { byBiggestOverlap: [], byHalfOfBiggestOverlap: [] };

        const pathToRightNode = returnPathFromRootToNode(result, nodesInConflict[1]);
        const nodesInConflictLCA = findLowestCommonAncestorIdOfNodes(result, ...nodesInConflict);

        if (!nodesInConflictLCA) throw "getTreesToShift nodesInConflictLCA";

        const lcaIndex = pathToRightNode.findIndex((id) => id === nodesInConflictLCA);

        if (lcaIndex === -1) throw "getTreesToShift lcaIndex error";

        getTreesToShiftFromNodePathInConflict(result);

        return treesToShift;

        function getTreesToShiftFromNodePathInConflict(tree: Tree<Skill>) {
            //Base Case 👇
            if (!tree.children) return undefined;
            if (tree.isRoot) treesToShift.byHalfOfBiggestOverlap.push(tree.data.id);

            //Recursive Case 👇
            const currentLevel = tree.level;
            const lcaLevel = lcaIndex;
            const nodeInPathIndexForChildren = tree.children.findIndex((t) => t.data.id === pathToRightNode[currentLevel + 1]);
            const areAnyOfChildrenInPath = nodeInPathIndexForChildren === -1 ? false : true;

            if (!areAnyOfChildrenInPath) return undefined;

            for (let i = 0; i < tree.children.length; i++) {
                const child = tree.children[i];

                if (i === nodeInPathIndexForChildren) {
                    if (currentLevel >= lcaLevel) {
                        treesToShift.byBiggestOverlap.push(child.data.id);
                    } else {
                        treesToShift.byHalfOfBiggestOverlap.push(child.data.id);
                    }
                    if (child.data.id === pathToRightNode[pathToRightNode.length - 1])
                        addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                    getTreesToShiftFromNodePathInConflict(child);
                }

                if (i > nodeInPathIndexForChildren) {
                    if (currentLevel >= lcaLevel) {
                        treesToShift.byBiggestOverlap.push(child.data.id);
                        addEveryChildFromTreeToArray(child, treesToShift.byBiggestOverlap);
                    } else {
                        treesToShift.byHalfOfBiggestOverlap.push(child.data.id);
                        addEveryChildFromTreeToArray(child, treesToShift.byHalfOfBiggestOverlap);
                    }
                }
            }
        }

        function addEveryChildFromTreeToArray(tree: Tree<Skill>, arrToAdd: string[]) {
            if (!tree.children) return;

            for (let i = 0; i < tree.children.length; i++) {
                const element = tree.children[i];

                arrToAdd.push(element.data.id);

                addEveryChildFromTreeToArray(element, arrToAdd);
            }
        }
    }

    function shiftNodes(
        result: Tree<Skill>,
        treesToShift: { byBiggestOverlap: string[]; byHalfOfBiggestOverlap: string[] },
        overlapDistance: number
    ) {
        const currentTreeShiftDistance = getCurrentTreeShiftDistance(result.data.id);

        const updatedTree: Tree<Skill> = { ...result, x: result.x + currentTreeShiftDistance };

        //Base Case 👇

        if (!result.children) return updatedTree;

        updatedTree.children = [];

        //Recursive Case 👇

        for (let i = 0; i < result.children.length; i++) {
            const element = result.children[i];

            updatedTree.children.push(shiftNodes(element, treesToShift, overlapDistance));
        }

        return updatedTree;

        function getCurrentTreeShiftDistance(treeId: string) {
            const shiftByBiggestOverlap = Boolean(treesToShift.byBiggestOverlap.find((id) => id === treeId));

            if (shiftByBiggestOverlap) return overlapDistance;

            const shiftByHalfOfBiggestOverlap = Boolean(treesToShift.byHalfOfBiggestOverlap.find((id) => id === treeId));

            if (shiftByHalfOfBiggestOverlap) return overlapDistance / 2;

            return 0;
        }
    }
};
