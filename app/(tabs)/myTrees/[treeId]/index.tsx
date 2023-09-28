import { RoutesParams } from "@/../routes";
import OpenSettingsMenu from "@/components/OpenSettingsMenu";
import ProgressIndicatorAndName from "@/components/ProgressIndicatorAndName";
import ShareTreeScreenshot from "@/components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "@/components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { normalizedNodeToTree } from "@/components/treeRelated/general/functions";
import SelectedNodeMenu, {
    SelectedNodeMenuFunctions,
    SelectedNodeMenuMutateFunctions,
    SelectedNodeMenuState,
} from "@/components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { IsSharingAvailableContext } from "@/context";
import { insertNodeAsChild, insertNodeAsParent, insertNodeAsSibling } from "@/functions/misc";
import { handleTreeBuild } from "@/functions/treeCalculateCoordinates";
import AddNodeStateIndicator from "@/pages/viewingSkillTree/AddNodeStateIndicator";
import IndividualSkillTree from "@/pages/viewingSkillTree/IndividualSkillTree";
import AddNodeModal from "@/pages/viewingSkillTree/modals/AddNodeModal";
import DeleteNodeModal from "@/pages/viewingSkillTree/modals/DeleteNodeModal";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { TreeData, selectTreeById } from "@/redux/slices/userTreesSlice";
import { addNodes, removeNodes, selectNodeById, selectNodesOfTree, updateNodes } from "@/redux/slices/nodesSlice";
import { selectSafeScreenDimentions } from "@/redux/slices/screenDimentionsSlice";
import { DnDZone, NormalizedNode, Skill, Tree, TreeCoordinateData } from "@/types";
import { useCanvasRef } from "@shopify/react-native-skia";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { View } from "react-native";

export type ModalState =
    | "TAKING_SCREENSHOT"
    | "EDITING_CANVAS_SETTINGS"
    | "IDLE"
    | "INPUT_DATA_FOR_NEW_NODE"
    | "CANDIDATES_TO_HOIST"
    | "PLACING_NEW_NODE"
    | "NODE_SELECTED";

export type ModalReducerAction =
    | "returnToIdle"
    | "openCandidatesToHoistModal"
    | "openNewNodeModal"
    | "openTakeScreenshotModal"
    | "openEditCanvasSettings"
    | "openSelectedNodeMenu"
    | "openNewNodePositionSelector";

function useViewingSkillTreeState(treeId: string) {
    //We can guarantee here that the type is TreeData because we will never pass the home tree id to the selector
    const treeData = useAppSelector(selectTreeById(treeId)) as TreeData;
    const treeNodes = useAppSelector(selectNodesOfTree(treeId));

    const selectedTree = normalizedNodeToTree(treeNodes, treeData);

    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const {
        dndZoneCoordinates,
        canvasDimentions: canvasDimensions,
        nodeCoordinatesCentered,
    } = handleTreeBuild(selectedTree, screenDimensions, "hierarchy");

    let treeCoordinate: TreeCoordinateData = { addNodePositions: dndZoneCoordinates, canvasDimensions, nodeCoordinates: nodeCoordinatesCentered };

    return { selectedTree, treeCoordinate, treeNodes, treeData };
}

function useModalStateReducer() {
    function reducer(state: ModalState, action: ModalReducerAction) {
        switch (action) {
            case "returnToIdle":
                return "IDLE";
            case "openCandidatesToHoistModal":
                return "CANDIDATES_TO_HOIST";
            case "openNewNodePositionSelector":
                return "PLACING_NEW_NODE";
            case "openEditCanvasSettings":
                return "EDITING_CANVAS_SETTINGS";
            case "openSelectedNodeMenu":
                return "NODE_SELECTED";
            case "openTakeScreenshotModal":
                return "TAKING_SCREENSHOT";
            case "openNewNodeModal":
                return "INPUT_DATA_FOR_NEW_NODE";
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, "IDLE");

    return [state, dispatch] as const;
}

function useCleanupOnNavigation(
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    functions: {
        resetNodeToDelete: () => void;
        clearSelectedNodeCoord: () => void;
        clearSelectedNewNodePosition: () => void;
    }
) {
    useEffect(() => {
        return () => {
            dispatchModalState("returnToIdle");
            functions.resetNodeToDelete();
            functions.clearSelectedNodeCoord();
            functions.clearSelectedNewNodePosition();
        };
    }, []);
}

function useHandleRouteParams(
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    treeCoordinate: TreeCoordinateData,
    functions: {
        updateSelectedNewNodePosition: (position: DnDZone) => void;
        updateSelectedNodeCoord: (node: NormalizedNode, menuMode: "EDITING" | "VIEWING") => void;
    }
) {
    //@ts-ignore
    const { nodeId, addNewNodePosition, selectedNodeMenuMode }: RoutesParams["myTrees_treeId"] = useLocalSearchParams();

    const selectedNode = useAppSelector(selectNodeById(nodeId))!;

    useEffect(() => {
        if (addNewNodePosition) {
            const newNodePosition = treeCoordinate.addNodePositions.find((position) => {
                return position.ofNode === nodeId && position.type === addNewNodePosition;
            });

            if (!newNodePosition) throw new Error("newNodePosition undefined at useHandleRouterParams - InidividualSkillTree");

            functions.updateSelectedNewNodePosition(newNodePosition);
            return dispatchModalState("openNewNodeModal");
        }

        const updatedSelectedNodeCoord = treeCoordinate.nodeCoordinates.find((n) => n.nodeId === nodeId);

        if (updatedSelectedNodeCoord) functions.updateSelectedNodeCoord(selectedNode, selectedNodeMenuMode ?? "VIEWING");

        //eslint-disable-next-line
    }, []);
}

function useNodeToDelete() {
    const [nodeToDelete, setNodeToDelete] = useState<NormalizedNode | null>(null);

    const resetNodeToDelete = () => setNodeToDelete(null);

    const updateNodeToDelete = (node: NormalizedNode) => setNodeToDelete(node);

    return [nodeToDelete, { updateNodeToDelete, resetNodeToDelete }] as const;
}

function useChildrenHoistSelectorProps(
    mutateNodeToDelete: { updateNodeToDelete: (node: NormalizedNode) => void; resetNodeToDelete: () => void },
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    clearSelectedNodeCoord: () => void
) {
    const { resetNodeToDelete, updateNodeToDelete } = mutateNodeToDelete;

    const openChildrenHoistSelector = useCallback((nodeToDelete: NormalizedNode) => {
        updateNodeToDelete(nodeToDelete);
        dispatchModalState("openCandidatesToHoistModal");
    }, []);

    //Select ChildrenToHoistWhenDeletingParentModal
    const closeChildrenHoistModal = () => {
        resetNodeToDelete();
        clearSelectedNodeCoord();
        dispatchModalState("returnToIdle");
    };

    return { openChildrenHoistSelector, closeChildrenHoistModal };
}

function useNodeStateIndicatorFunctions(dispatchModalState: React.Dispatch<ModalReducerAction>, modalState: ModalState) {
    return useMemo(() => {
        return {
            returnToIdleState: () => {
                dispatchModalState("returnToIdle");
            },
            openNewNodePositionSelector: () => {
                if (modalState !== "IDLE") return;
                dispatchModalState("openNewNodePositionSelector");
            },
        };
    }, []);
}

function useAddNodeModalFunctions(
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    selectedTree: Tree<Skill>,
    clearSelectedNewNodePosition: () => void
) {
    const nodesOfTree = useAppSelector(selectNodesOfTree(selectedTree.treeId));
    const dispatch = useAppDispatch();

    const result = (newNodes: Tree<Skill>[], dnDZone: DnDZone) => {
        const normalizedNewNodes: NormalizedNode[] = newNodes.map((node) => {
            return {
                category: node.category,
                data: node.data,
                isRoot: node.isRoot,
                level: node.level,
                nodeId: node.nodeId,
                parentId: node.parentId,
                treeId: node.treeId,
                x: node.x,
                y: node.y,
                childrenIds: node.children.map((node) => node.nodeId),
            };
        });

        switch (dnDZone.type) {
            case "CHILDREN":
                let childCase = insertNodeAsChild(nodesOfTree, normalizedNewNodes, dnDZone);

                dispatch(
                    updateNodes(
                        childCase.nodesToUpdate.map((node) => {
                            return { id: node.nodeId, changes: node };
                        })
                    )
                );
                dispatch(addNodes({ treeId: selectedTree.treeId, nodesToAdd: childCase.nodesToAdd }));
                break;
            case "LEFT_BROTHER":
                const leftCase = insertNodeAsSibling(nodesOfTree, normalizedNewNodes, dnDZone);
                dispatch(
                    updateNodes(
                        leftCase.nodesToUpdate.map((node) => {
                            return { id: node.nodeId, changes: node };
                        })
                    )
                );
                dispatch(addNodes({ treeId: selectedTree.treeId, nodesToAdd: leftCase.nodesToAdd }));
                break;
            case "RIGHT_BROTHER":
                const rightCase = insertNodeAsSibling(nodesOfTree, normalizedNewNodes, dnDZone);
                dispatch(
                    updateNodes(
                        rightCase.nodesToUpdate.map((node) => {
                            return { id: node.nodeId, changes: node };
                        })
                    )
                );
                dispatch(addNodes({ treeId: selectedTree.treeId, nodesToAdd: rightCase.nodesToAdd }));
                break;

            default:
                const parentCase = insertNodeAsParent(nodesOfTree, normalizedNewNodes[0], dnDZone);
                dispatch(
                    updateNodes(
                        parentCase.nodesToUpdate.map((node) => {
                            return { id: node.nodeId, changes: node };
                        })
                    )
                );
                dispatch(addNodes({ treeId: selectedTree.treeId, nodesToAdd: [parentCase.nodeToAdd] }));
                break;
        }
        // let result = insertNodesBasedOnDnDZone(dnDZone, selectedTree, newNodes);

        // if (result === undefined) throw new Error("result undefined at foo");

        // const treeSkillCompletion = treeCompletedSkillPercentage(result);

        // if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        // if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        // dispatch(updateUserTreeWithAppendedNode(result));
        clearSelectedNewNodePosition();
        dispatchModalState("returnToIdle");
    };

    return result;
}

export type SelectedNewNodePositionState = readonly [
    DnDZone | null,
    {
        readonly clearSelectedNewNodePosition: () => void;
        readonly updateSelectedNewNodePosition: (position: DnDZone) => void;
    }
];

function useSelectedNewNodePositionState() {
    const [newNodePosition, setNewNodePosition] = useState<DnDZone | null>(null);

    const clearSelectedNewNodePosition = () => setNewNodePosition(null);
    const updateSelectedNewNodePosition = (position: DnDZone) => setNewNodePosition(position);

    return [newNodePosition, { clearSelectedNewNodePosition, updateSelectedNewNodePosition }] as SelectedNewNodePositionState;
}

export type SelectedNodeCoordState = readonly [
    {
        node: NormalizedNode | null;
        menuMode: "EDITING" | "VIEWING";
    } | null,
    {
        readonly clearSelectedNodeCoord: () => void;
        readonly updateSelectedNodeCoord: (node: NormalizedNode, menuMode: "EDITING" | "VIEWING") => void;
    }
];

function useSelectedNodeCoordState(dispatchModalState: React.Dispatch<ModalReducerAction>) {
    const [selectedNodeCoord, setSelectedNodeCoord] = useState<{ node: NormalizedNode | null; menuMode: "EDITING" | "VIEWING" } | null>(null);

    const clearSelectedNodeCoord = () => {
        setSelectedNodeCoord(null);
        dispatchModalState("returnToIdle");
    };
    const updateSelectedNodeCoord = (node: NormalizedNode, menuMode: "EDITING" | "VIEWING") => setSelectedNodeCoord({ node, menuMode });

    return [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] as const;
}

function useGetSelectedNodeMenuFns(
    selectedNode: NormalizedNode | undefined,
    openChildrenHoistSelector: (nodeToDelete: NormalizedNode) => void,
    clearSelectedNodeCoord: () => void
) {
    const dispatch = useAppDispatch();

    const closeMenu = clearSelectedNodeCoord;

    const handleDeleteNode = (nodeToDelete: NormalizedNode) => {
        if (nodeToDelete.childrenIds.length !== 0) return openChildrenHoistSelector(nodeToDelete);

        dispatch(removeNodes({ treeId: nodeToDelete.treeId, nodesToDelete: [nodeToDelete.nodeId] }));
        clearSelectedNodeCoord();
    };

    const updateNode = (updatedNode: NormalizedNode) => {
        try {
            if (!selectedNode) throw new Error("No selected node at updateNode");

            dispatch(updateNodes([{ id: updatedNode.nodeId, changes: { data: updatedNode.data } }]));
        } catch (error) {
            console.error(error);
        }
    };

    const goToSkillPage = () => {
        if (!selectedNode) throw new Error("No selected node at goToSkillPage");
        const params: RoutesParams["myTrees_skillId"] = { skillId: selectedNode.nodeId, treeId: selectedNode.treeId };
        router.push({ pathname: `/myTrees/${selectedNode.treeId}/${selectedNode.nodeId}`, params });
    };
    const goToTreePage = () => {
        if (!selectedNode) throw new Error("No selected node at goToTreePage");
        const params: RoutesParams["myTrees_treeId"] = { nodeId: selectedNode.nodeId, treeId: selectedNode.treeId };
        router.push({ pathname: `/myTrees/${selectedNode.treeId}`, params });
    };
    const goToEditTreePage = () => {
        if (!selectedNode) throw new Error("No selected node at goToTreePage");
        const params: RoutesParams["myTrees"] = { editingTreeId: selectedNode.treeId };
        router.push({ pathname: `/myTrees`, params });
    };

    const result: { query: SelectedNodeMenuFunctions; mutate: SelectedNodeMenuMutateFunctions } = {
        mutate: { handleDeleteNode, updateNode },
        query: { closeMenu, goToEditTreePage, goToSkillPage, goToTreePage },
    };

    return result;
}

function IndividualSkillTreePage() {
    const localParams = useLocalSearchParams();
    //@ts-ignore
    const { treeId }: RoutesParams["myTrees_treeId"] = localParams;

    //Redux State
    const { selectedTree, treeCoordinate, treeNodes, treeData } = useViewingSkillTreeState(treeId);

    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    //
    const modalStateReducer = useModalStateReducer();
    const [modalState, dispatchModalState] = modalStateReducer;
    //
    const selectedNodeCoordState = useSelectedNodeCoordState(dispatchModalState);
    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;
    //
    const selectedNewNodePositionState = useSelectedNewNodePositionState();
    const [selectedNewNodePosition, { clearSelectedNewNodePosition, updateSelectedNewNodePosition }] = selectedNewNodePositionState;
    //Local State
    const [nodeToDelete, mutateNodeToDelete] = useNodeToDelete();
    const { resetNodeToDelete } = mutateNodeToDelete;
    //Hooks
    const { closeChildrenHoistModal, openChildrenHoistSelector } = useChildrenHoistSelectorProps(
        mutateNodeToDelete,
        dispatchModalState,
        clearSelectedNodeCoord
    );
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    //
    useHandleRouteParams(dispatchModalState, treeCoordinate, {
        updateSelectedNewNodePosition,
        updateSelectedNodeCoord,
    });
    useCleanupOnNavigation(dispatchModalState, { resetNodeToDelete, clearSelectedNewNodePosition, clearSelectedNodeCoord });
    //
    const nodeStateIndicatorFunctions = useNodeStateIndicatorFunctions(dispatchModalState, modalState);
    const addNodes = useAddNodeModalFunctions(dispatchModalState, selectedTree, clearSelectedNewNodePosition);
    //
    const showNewNodePositions = modalState === "PLACING_NEW_NODE";
    const shouldRenderShareButton = isSharingAvailable && modalState === "IDLE";
    const showAddNodeModal = selectedNewNodePosition !== null;

    const takingScreenshotState = [
        modalState === "TAKING_SCREENSHOT",
        {
            openTakingScreenshotModal: () => dispatchModalState("openTakeScreenshotModal"),
            closeTakingScreenshotModal: () => dispatchModalState("returnToIdle"),
        },
    ] as const;

    const treeFunctions = {
        openChildrenHoistSelector: openChildrenHoistSelector,
        openCanvasSettingsModal: () => dispatchModalState("openEditCanvasSettings"),
        openNewNodeModal: () => dispatchModalState("openNewNodeModal"),
    };

    const selectedNode = treeNodes.find((n) => n.nodeId === selectedNodeCoord?.node?.nodeId ?? null);

    const selectedNodeMenuState: SelectedNodeMenuState = {
        screenDimensions,
        selectedNode: selectedNode!,
        initialMode: selectedNodeCoord?.menuMode ?? "VIEWING",
    };

    const selectedNodeMenuFunctions = useGetSelectedNodeMenuFns(selectedNode, openChildrenHoistSelector, clearSelectedNodeCoord);

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            <IndividualSkillTree
                state={{
                    selectedNodeCoordState,
                    selectedNewNodePositionState,
                    addNodePositions: treeCoordinate.addNodePositions,
                    showNewNodePositions,
                }}
                canvasRef={canvasRef}
                tree={selectedTree}
                functions={treeFunctions}
            />
            <ProgressIndicatorAndName nodesOfTree={treeNodes} treeData={treeData} />

            <ShareTreeScreenshot
                canvasRef={canvasRef}
                shouldShare={Boolean(shouldRenderShareButton)}
                takingScreenshotState={takingScreenshotState}
                treeData={treeData}
            />
            {/* <ShareTree tree={selectedTree} show={modalState === "IDLE"} /> */}

            <OpenSettingsMenu show={modalState === "IDLE"} openModal={() => dispatchModalState("openEditCanvasSettings")} />

            <AddNodeStateIndicator mode={modalState} functions={nodeStateIndicatorFunctions} currentTree={selectedTree} />

            {selectedNodeCoord && (
                <SelectedNodeMenu
                    functions={selectedNodeMenuFunctions.query}
                    mutateFunctions={selectedNodeMenuFunctions.mutate}
                    state={selectedNodeMenuState}
                    allowEdit
                />
            )}

            {nodeToDelete && (
                <DeleteNodeModal
                    open={modalState === "CANDIDATES_TO_HOIST"}
                    nodeToDelete={nodeToDelete}
                    closeModalAndClearState={closeChildrenHoistModal}
                />
            )}
            {showAddNodeModal && (
                <AddNodeModal
                    open={modalState === "INPUT_DATA_FOR_NEW_NODE"}
                    addNodes={addNodes}
                    closeModal={() => {
                        clearSelectedNewNodePosition();
                        dispatchModalState("returnToIdle");
                    }}
                    selectedTree={selectedTree}
                    dnDZone={selectedNewNodePosition}
                />
            )}

            <CanvasSettingsModal open={modalState === "EDITING_CANVAS_SETTINGS"} closeModal={() => dispatchModalState("returnToIdle")} />
        </View>
    );
}

export default IndividualSkillTreePage;
