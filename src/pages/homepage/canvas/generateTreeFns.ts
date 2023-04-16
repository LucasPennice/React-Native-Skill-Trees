import { CirclePositionInCanvasWithLevel, Skill, Tree, TreeWithCoord } from "../../../types";
import { findDistanceBetweenNodesById, findTreeNodeById } from "../treeFunctions";
import { DISTANCE_BETWEEN_GENERATIONS } from "./parameters";

type Coordinates = { x: number; y: number; id: string; level: number; parentId: string | null; name: string };

export const PlotTreeReingoldTiltfordAlgorithm = (completeTree: Tree<Skill>) => {
    let result: TreeWithCoord<Skill>;

    result = firstIteration(completeTree);

    result = handleOverlap(result);

    const sex: Coordinates[] = [];
    treeToCoordArray(result, sex);

    return sex;

    function firstIteration(tree: Tree<Skill>, currentTreeMod?: number, childrenIdx?: number) {
        //Base Case 👇

        let x = (childrenIdx ?? 0) + (currentTreeMod ?? 0);
        let desiredXValueToCenterChildren = 0;
        const isFirstNode = childrenIdx === 0;

        const distance = findDistanceBetweenNodesById(completeTree, tree.data.id);
        const level = distance ? distance - 1 : 0;

        const result: TreeWithCoord<Skill> = {
            ...tree,
            x,
            y: level * DISTANCE_BETWEEN_GENERATIONS,
            level,
            children: undefined,
        };

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

    function treeToCoordArray(tree: TreeWithCoord<Skill>, result: Coordinates[]) {
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

    function handleOverlap(tree: TreeWithCoord<Skill>) {
        let overlapInTree = true;
        let loopAvoider = 0;

        let result: TreeWithCoord<Skill> = { ...tree };

        const coordArray: Coordinates[] = [];
        treeToCoordArray(result, coordArray);
        const treeDepths = coordArray.map((t) => t.level);
        const treeDepth = Math.max(...treeDepths);

        while (overlapInTree && loopAvoider < treeDepth) {
            const { isOverlap, overlapDistance, treeToShiftFromId } = checkForOverlap(result);

            if (isOverlap) {
                const treesToShift = getTreesToShift(result, treeToShiftFromId);
                result = shiftNodeAndDescendants(result, treesToShift, overlapDistance);
            } else {
                overlapInTree = false;
            }
            loopAvoider++;
        }

        result = centerRoot(result);

        return result;

        function centerRoot(tree: TreeWithCoord<Skill>) {
            if (!tree.children) return tree;

            const leftChildrenCoord = tree.children[0].x;
            const rightChildrenCoord = tree.children[tree.children.length - 1].x;

            return { ...tree, x: leftChildrenCoord + (rightChildrenCoord - leftChildrenCoord) / 2 } as TreeWithCoord<Skill>;
        }
    }

    function checkForOverlap(tree: TreeWithCoord<Skill>) {
        const result: { [key: string]: [number, number, string][] } = {};
        getTreeContourByLevel(tree, result);

        let biggestOverlap = 0;
        let treeToShiftFromId = "";
        let isOverlap = false;

        const keys = Object.keys(result);

        keys.forEach((key) => {
            const levelContours = result[key];
            let levelTreeToShiftFromId = "";

            const levelOverlap = levelContours.reduce((maxLevelOverlap: number, currentContour, idx) => {
                if (idx === levelContours.length - 1) return maxLevelOverlap;

                const nextContour = levelContours[idx + 1];

                if (currentContour[1] < nextContour[0]) return maxLevelOverlap;

                const currentOverlap = Math.abs(currentContour[1] - nextContour[0]);

                if (currentOverlap > maxLevelOverlap) {
                    levelTreeToShiftFromId = currentContour[2];
                    return currentOverlap;
                }

                return maxLevelOverlap;
            }, -1);

            if (levelOverlap >= biggestOverlap) {
                isOverlap = true;
                biggestOverlap = levelOverlap;
                treeToShiftFromId = levelTreeToShiftFromId;
            }
        });

        return { isOverlap, overlapDistance: biggestOverlap + 1, treeToShiftFromId };
    }

    function getTreeContourByLevel(tree: TreeWithCoord<Skill>, result: { [key: string]: [number, number, string][] }, subTreeParentId?: string) {
        //Base Case 👇

        if (!tree.children) return;

        //Recursive Case 👇

        const leftMostX = tree.children[0].x;
        const rightMostX = tree.children[tree.children.length - 1].x;

        const key = `${tree.level}`;

        const foo = tree.level === 1 ? tree.data.id : subTreeParentId ?? "";

        if (result[key]) result[key] = [...result[key], [leftMostX, rightMostX, foo]];
        if (!result[key]) result[key] = [[leftMostX, rightMostX, foo]];

        for (let i = 0; i < tree.children.length; i++) {
            const element = tree.children[i];

            getTreeContourByLevel(element, result, foo);
        }
    }

    function getTreesToShift(result: TreeWithCoord<Skill>, treeToShiftFromId: string) {
        if (!result.children) return [];

        const levelOneTrees = result.children;
        const levelOneTreeIds = levelOneTrees.map((t) => t.data.id);

        const idToShiftFrom = levelOneTreeIds.findIndex((t) => t === treeToShiftFromId);

        if (idToShiftFrom === -1) throw "getTreesToShift error";

        return levelOneTreeIds.filter((t, idx) => {
            if (idx > idToShiftFrom) return t;
        });
    }

    function shiftNodeAndDescendants(result: TreeWithCoord<Skill>, treesToShift: string[], overlapDistance: number, shouldShift?: boolean) {
        const updatedShouldShift = getShouldShift();

        const updatedTree: TreeWithCoord<Skill> = { ...result, x: updatedShouldShift || result.isRoot ? result.x + overlapDistance : result.x };

        //Base Case 👇

        if (!result.children) return updatedTree;

        updatedTree.children = [];

        //Recursive Case 👇

        for (let i = 0; i < result.children.length; i++) {
            const element = result.children[i];

            updatedTree.children.push(shiftNodeAndDescendants(element, treesToShift, overlapDistance, updatedShouldShift));
        }

        return updatedTree;

        function getShouldShift() {
            if (result.level === 0) return true;

            if (result.level === 1) return Boolean(treesToShift.find((id) => id === result.data.id));

            return shouldShift;
        }
    }
};
