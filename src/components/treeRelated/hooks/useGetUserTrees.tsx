import { useAppSelector } from "@/redux/reduxHooks";
import { TreeData, selectAllTrees } from "@/redux/slices/newUserTreesSlice";
import { selectAllNodeIds, selectAllNodes } from "@/redux/slices/nodesSlice";
import { normalizedNodeToTree } from "../general/functions";
import { NormalizedNode } from "@/types";
import { useEffect } from "react";

function useGetUserTrees() {
    const userTreesData = useAppSelector(selectAllTrees);
    const nodes = useAppSelector(selectAllNodes);

    const nodesIds = useAppSelector(selectAllNodeIds);

    // useEffect(() => {
    //     console.log("---");
    //     console.log(JSON.stringify(nodes));
    //     console.log(JSON.stringify(nodesIds));
    //     console.log(JSON.stringify(userTreesData));
    // }, [nodes, userTreesData, nodesIds]);

    const result = getFoo(userTreesData, nodes);

    // console.log(JSON.stringify(result));

    return { userTrees: result, allNodes: nodes };
}

function getFoo(userTreesData: TreeData[], nodes: NormalizedNode[]) {
    const result = userTreesData.map((userTreeData) => {
        const nodesOfTree = nodes.filter((n) => n.treeId === userTreeData.treeId);

        return normalizedNodeToTree(nodesOfTree, userTreeData);
    });

    return result;
}

export default useGetUserTrees;
