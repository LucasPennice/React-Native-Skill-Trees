import { Skill, Tree, TreeWithCoord } from "../../../types";
import { findDistanceBetweenNodesById } from "../treeFunctions";

export type Coordinates = { x: number; y: number; id: string; level: number; parentId: string | null; name: string };
type Contour = { leftNode: { coord: number; id: string }; rightNode: { coord: number; id: string } };

export const PlotTreeReingoldTiltfordAlgorithm = (completeTree: Tree<Skill>) => {
    let result: TreeWithCoord<Skill>;

    result = firstIteration(completeTree);

    result = handleOverlap(result);

    // console.log(findLowestCommonAncestorBetweenTwoNodes(result, "6dY22wGk3UokVBvqo45DEiBq", "4zcot4mPH3OMv8s5RzGSannk"));
    // console.log(findLowestCommonAncestorBetweenTwoNodes(result, "ZrdECsSu7lR0MAfNKz5tOblT", "WPiirE7xvMqooQ75C37m9eGh"));

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

        const result: TreeWithCoord<Skill> = { ...tree, x, y: level, level, children: undefined };

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
        let loopAvoider = -1;

        let result: TreeWithCoord<Skill> = { ...tree };

        const coordArray: Coordinates[] = [];
        treeToCoordArray(result, coordArray);
        const treeDepths = coordArray.map((t) => t.level);
        const treeDepth = Math.max(...treeDepths);

        while (overlapInTree && loopAvoider <= treeDepth) {
            const overlap = checkForOverlap(result);

            console.log(overlap);
            //Quiero que overlap devuelva el nivel y la id a partir de la cual quiero separar (los hijos del primer nodo que tengan en comun)
            //Esa id y sus hermanos por derecha se shiftean overlap.biggestOverlap
            //Los nodos con niveles menores shiftean la mitad de la cantidad

            if (overlap !== undefined) {
                const treesToShift = getTreesToShift(result, overlap.treeToShiftFromId);
                result = shiftNodeAndDescendants(result, treesToShift, overlap.biggestOverlap);
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

    type OverlapCheck = undefined | { biggestOverlap: number; treeToShiftFromId: string };

    function checkForOverlap(tree: TreeWithCoord<Skill>) {
        const contourByLevel: { [key: string]: [number, number, string][] } = {};
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

        return result as { biggestOverlap: number; treeToShiftFromId: string } | undefined;
    }

    function getLevelBiggestOverlap(levelContour: [number, number, string][]) {
        let result: { biggestOverlap: number; treeToShiftFromId: string } | undefined = undefined;

        for (let idx = 0; idx < levelContour.length; idx++) {
            const isOnLastContour = idx === levelContour.length - 1;

            //We return on the last item because we compare the current contour with the next one, and the next contour doesn't exist on this iteration
            if (isOnLastContour) return result;

            const currentContour = levelContour[idx];
            const nextContour = levelContour[idx + 1];

            //I define two nodes perfectly overlapping as poor spacing and not overlap
            const overlapBetweenThisAndNextContour = currentContour[1] > nextContour[0];
            const overlapDistance = Math.abs(currentContour[1] - nextContour[0]);

            const overlap = overlapBetweenThisAndNextContour && (result === undefined || result.biggestOverlap < overlapDistance);

            const nodeSpacing = nextContour[0] - currentContour[1];

            const poorSpacing = !overlap && nodeSpacing < 1 && (result === undefined || result.biggestOverlap < nodeSpacing);

            if (overlap) result = { biggestOverlap: overlapDistance, treeToShiftFromId: currentContour[2] };

            if (poorSpacing) result = { biggestOverlap: 1 - nodeSpacing, treeToShiftFromId: currentContour[2] };
        }

        return result;
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
