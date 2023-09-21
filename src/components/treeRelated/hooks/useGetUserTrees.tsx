import { useAppSelector } from "@/redux/reduxHooks";
import { TreeData, selectAllTrees } from "@/redux/slices/userTreesSlice";
import { selectAllNodes } from "@/redux/slices/nodesSlice";
import { NormalizedNode } from "@/types";
import { normalizedNodeToTree } from "../general/functions";

function useGetUserTrees() {
    const userTreesData = useAppSelector(selectAllTrees);
    const nodes = useAppSelector(selectAllNodes);

    const result = getSubTrees(userTreesData, nodes);

    return { userTrees: result, allNodes: nodes };
}

function getSubTrees(userTreesData: TreeData[], nodes: NormalizedNode[]) {
    const result = userTreesData.map((userTreeData) => {
        const nodesOfTree = nodes.filter((n) => n.treeId === userTreeData.treeId);

        return normalizedNodeToTree(nodesOfTree, userTreeData);
    });

    return result;
}

export default useGetUserTrees;
