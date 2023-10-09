import { arrayToDictionary } from "@/functions/extractInformationFromTree";
import { TIME_TO_REORDER_TREE } from "@/parameters";
import { NodeCoordinate, ReactiveNodeCoordinate } from "@/types";
import useStorePreviousState from "@/useStorePreviousState";
import { useEffect, useRef, useState } from "react";

type StateBehavior = "Entering" | "Exiting";

type Result = {
    behavior: StateBehavior;
    reactiveNodes: ReactiveNodeCoordinate[];
    staticNodes: NodeCoordinate[];
};

function checkIfTreeCoordinatesChanged(newState: NodeCoordinate[], oldState?: NodeCoordinate[]): Result {
    //The oldState ref is uninitilized, this does not mean that we want to render the nodes as reactive because the initial render does
    //not qualify as a "tree mutation"
    if (oldState === undefined) return { behavior: "Exiting", reactiveNodes: [], staticNodes: newState };

    const newStateDictionary = arrayToDictionary(newState);
    const oldStateDictionary = arrayToDictionary(oldState);

    const allKeysArrayPossiblyRepeated = [...Object.keys(newStateDictionary), ...Object.keys(oldStateDictionary)];
    const allKeysSet = new Set(allKeysArrayPossiblyRepeated);
    const allKeysArray = Array.from(allKeysSet);

    const reactiveNodes: ReactiveNodeCoordinate[] = [];
    const staticNodes: NodeCoordinate[] = [];
    let behavior: StateBehavior = "Exiting";

    for (let i = 0; i < allKeysArray.length; i++) {
        const nodeId = allKeysArray[i];

        const nodeInNewState = newStateDictionary[nodeId];
        const nodeInOldState = oldStateDictionary[nodeId];

        if (!nodeInNewState && !nodeInOldState) throw new Error("node does not exist in new or old state useHandleReactiveAndStaticNodeList");

        //Deleted a node case
        if (!nodeInNewState && nodeInOldState) continue;

        //Added a node case
        if (nodeInNewState && !nodeInOldState) {
            behavior = "Entering";
            reactiveNodes.push({ ...nodeInNewState, initialCoordinates: { x: 0, y: 0 } });
            continue;
        }

        if (!nodeInNewState || !nodeInOldState) throw new Error("node does not exist in new or old state useHandleReactiveAndStaticNodeList");
        //Now we can guarantee that the node exists in both states

        if (nodeInNewState.x !== nodeInOldState.x || nodeInNewState.y !== nodeInOldState.y) {
            behavior = "Entering";
            reactiveNodes.push({ ...nodeInNewState, initialCoordinates: { x: nodeInOldState.x, y: nodeInOldState.y } });
            continue;
        }

        if (nodeInNewState.data.isCompleted !== nodeInOldState.data.isCompleted) {
            behavior = "Entering";
            reactiveNodes.push({ ...nodeInNewState, initialCoordinates: { x: nodeInNewState.x, y: nodeInNewState.y } });
            continue;
        }

        staticNodes.push(nodeInNewState);
    }

    return { behavior, reactiveNodes, staticNodes };
}

// function useTrackDragState(dragState: undefined): StateBehavior {
//     const [result, setResult] = useState<StateBehavior>("Exiting");
//     const prevDragState = useStorePreviousState<undefined>(dragState);

//     const timerId = useRef<NodeJS.Timeout | null>(null);

//     useEffect(() => {
//         console.log(prevDragState, dragState);
//         if (prevDragState === undefined && dragState === undefined) return setResult("Exiting");

//         if (prevDragState === undefined && dragState !== undefined) return setResult("Entering");

//         timerId.current = setTimeout(() => {
//             setResult("Exiting");
//         }, TIME_TO_REORDER_TREE);

//         return () => {
//             if (timerId.current) clearTimeout(timerId.current);
//         };
//     }, [dragState]);

//     return result;
// }

function useTrackTreeNodesState(treeNodes: NodeCoordinate[]): Result {
    const [result, setResult] = useState<Result>({ behavior: "Exiting", reactiveNodes: [], staticNodes: treeNodes });
    //TESTEAR ESTO CUANDO CAMBIO EL NOMBRE U OTRA COSA QUE NO SEAN LAS COORDENADAS
    const prevTreeNodesState = useStorePreviousState<NodeCoordinate[]>(treeNodes);

    const timerId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const nodeCoordinatesChanged = checkIfTreeCoordinatesChanged(treeNodes, prevTreeNodesState);

        if (nodeCoordinatesChanged.behavior === "Entering") {
            setResult(nodeCoordinatesChanged);
            timerId.current = setTimeout(() => {
                setResult({ behavior: "Exiting", reactiveNodes: [], staticNodes: treeNodes });
            }, TIME_TO_REORDER_TREE);
        }

        return () => {
            if (timerId.current) clearTimeout(timerId.current);
        };
    }, [treeNodes]);

    return result;
}

function useHandleReactiveAndStaticNodeList(treeNodes: NodeCoordinate[], dragAndDrop: undefined) {
    // const dragAndDropTrack = useTrackDragState(dragAndDrop);
    const treeNodesTrack = useTrackTreeNodesState(treeNodes);

    if (treeNodesTrack.behavior === "Entering") return { reactiveNodes: treeNodesTrack.reactiveNodes, staticNodes: treeNodesTrack.staticNodes };

    return { reactiveNodes: [], staticNodes: treeNodes };
}

export default useHandleReactiveAndStaticNodeList;
