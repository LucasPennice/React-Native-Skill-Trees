import { NodeCoordinate, NormalizedNode } from "@/types";
import useStorePreviousState from "@/useStorePreviousState";
import { useEffect, useRef, useState } from "react";
import { DESELECT_NODE_ANIMATION_DURATION } from "../general/useHandleGroupTransform";

function useHandleReactiveAndStaticNodeList(treeNodes: NodeCoordinate[], selectedNodeCoord: NormalizedNode | null, dragAndDrop: undefined) {
    const [result, setResult] = useState<{ reactiveNodes: NodeCoordinate[]; staticNodes: NodeCoordinate[] }>({
        reactiveNodes: [],
        staticNodes: treeNodes,
    });
    const lastAction = useRef<"SelectedNode" | "DragAndDrop" | "TreeMutation">();

    const oldTreeNodes = useStorePreviousState<NodeCoordinate[]>(treeNodes);

    const timerId = useRef<NodeJS.Timeout | null>(null);

    const setAllNodesToStatic = () => setResult({ reactiveNodes: [], staticNodes: treeNodes });

    useEffect(() => {
        if (selectedNodeCoord) {
            setResult(handleSelectedNodeCoord(treeNodes, selectedNodeCoord.nodeId));
        } else {
            timerId.current = setTimeout(() => {
                setAllNodesToStatic();
            }, DESELECT_NODE_ANIMATION_DURATION);
        }
        return () => {
            if (timerId.current) clearTimeout(timerId.current);
        };
    }, [treeNodes, selectedNodeCoord, dragAndDrop]);

    return result;
}

function handleSelectedNodeCoord(treeNodes: NodeCoordinate[], selectedNodeCoordId: string) {
    const reactiveNodes: NodeCoordinate[] = [];
    const staticNodes: NodeCoordinate[] = [];

    for (let i = 0; i < treeNodes.length; i++) {
        const node = treeNodes[i];

        if (node.nodeId === selectedNodeCoordId) {
            reactiveNodes.push(node);
            continue;
        }

        staticNodes.push(node);
    }

    return { reactiveNodes, staticNodes };
}

export default useHandleReactiveAndStaticNodeList;
