import { useAppSelector } from "@/redux/reduxHooks";
import { selectAllTrees } from "@/redux/slices/newUserTreesSlice";
import { selectAllNodes } from "@/redux/slices/nodesSlice";
import { normalizedNodeToTree } from "../general/functions";

function useGetUserTrees() {
    const userTreesData = useAppSelector(selectAllTrees);
    const nodes = useAppSelector(selectAllNodes);

    const result = userTreesData.map((userTreeData) => {
        const nodesOfTree = nodes.filter((n) => n.treeId === userTreeData.treeId);

        return normalizedNodeToTree(nodesOfTree, userTreeData);
    });

    return result;
}

export default useGetUserTrees;
