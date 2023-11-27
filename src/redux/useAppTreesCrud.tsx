import { HOMETREE_ROOT_ID } from "@/parameters";
import { NormalizedNode, getDefaultSkillValue } from "@/types";
import { batch } from "react-redux";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { addNodes, selectNodeById, updateNodes } from "./slices/nodesSlice";
import { TreeData, addUserTrees } from "./slices/userTreesSlice";

export const useCreateTrees = (trees: readonly TreeData[]) => {
    const dispatch = useAppDispatch();
    const homeRootNode = useAppSelector(selectNodeById(HOMETREE_ROOT_ID));

    if (!homeRootNode) throw new Error("homeRootNode not found at useCreateTrees");

    const newRootNodes: NormalizedNode[] = [];

    for (let i = 0; i < trees.length; i++) {
        const treeToAdd = trees[i];

        const rootNode: NormalizedNode = {
            category: "SKILL_TREE",
            childrenIds: [],
            data: getDefaultSkillValue(treeToAdd.treeName, false, treeToAdd.icon),
            isRoot: true,
            level: 0,
            nodeId: treeToAdd.rootNodeId,
            parentId: null,
            treeId: treeToAdd.treeId,
            x: 0,
            y: 0,
        };

        newRootNodes.push(rootNode);
    }

    const createTrees = () => {
        batch(() => {
            dispatch(addUserTrees(trees));
            dispatch(addNodes(newRootNodes));
            dispatch(
                updateNodes([{ id: HOMETREE_ROOT_ID, changes: { childrenIds: [...homeRootNode.childrenIds, ...newRootNodes.map((n) => n.nodeId)] } }])
            );
        });
    };

    return createTrees;
};

export const useImportTrees = (trees: readonly TreeData[], nodes: NormalizedNode[]) => {
    const dispatch = useAppDispatch();

    const homeRootNode = useAppSelector(selectNodeById(HOMETREE_ROOT_ID));

    if (!homeRootNode) throw new Error("homeRootNode not found at useImportTrees");

    const importTrees = () => {
        batch(() => {
            dispatch(addUserTrees(trees));
            dispatch(addNodes(nodes));
            dispatch(
                updateNodes([{ id: HOMETREE_ROOT_ID, changes: { childrenIds: [...homeRootNode.childrenIds, ...trees.map((n) => n.rootNodeId)] } }])
            );
        });
    };

    return importTrees;
};

// export const useUpdateTree = ( update: Update<TreeData>) => {
//         const dispatch = useAppDispatch();
//         const homeRootNode = useAppSelector(selectTreeById(update.id));
// }
