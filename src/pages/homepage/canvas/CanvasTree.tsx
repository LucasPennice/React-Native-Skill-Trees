import { createBezierPathBetweenPoints } from "./functions";
import { Blur, Path, useSpring } from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { colors } from "./parameters";
import useHandleTreeAnimations from "./hooks/useHandleTreeAnimations";
import { findDistanceBetweenNodesById, findParentOfNode } from "../treeFunctions";
import Label from "./Label";
import Node from "./Node";

type TreeProps = {
    tree: Tree<Skill>;
    wholeTree: Tree<Skill>;
    parentNodeInfo?: { coordinates: { x: number; y: number }; numberOfChildren: number; currentChildIndex: number };
    stateProps: {
        selectedNode: string | null;
        showLabel: boolean;
        circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
        tentativeCirlcePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    };
    rootCoordinates?: { width: number; height: number };
};

function CanvasTree({ tree, parentNodeInfo, stateProps, rootCoordinates: rC, wholeTree }: TreeProps) {
    //Props
    const { selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas } = stateProps;

    const defaultParentInfo = parentNodeInfo ?? { coordinates: { x: rC!.width, y: rC!.height }, numberOfChildren: 1, currentChildIndex: 0 };

    const previewMode = tentativeCirlcePositionsInCanvas.length !== 0;

    //Coordinates calculation
    const currentNodeTentativeCoordinates = tentativeCirlcePositionsInCanvas.find((c) => c.id === tree.data.id);

    const currentNodeParentTentativeCoordinates = tentativeCirlcePositionsInCanvas.find((c) => {
        if (!currentNodeTentativeCoordinates) return false;
        return c.id === currentNodeTentativeCoordinates.parentId;
    });

    const currentNodeCoordintes = circlePositionsInCanvas.find((c) => c.id === tree.data.id)!;

    const pathInitialPoint =
        previewMode && currentNodeParentTentativeCoordinates ? currentNodeParentTentativeCoordinates : defaultParentInfo.coordinates;

    const cx = currentNodeTentativeCoordinates ? currentNodeTentativeCoordinates.x : currentNodeCoordintes.x;
    const cy = currentNodeTentativeCoordinates ? currentNodeTentativeCoordinates.y : currentNodeCoordintes.y;
    // --

    let newParentNodeInfo = { coordinates: { ...currentNodeCoordintes, x: cx, y: cy }, numberOfChildren: tree.children ? tree.children.length : 0 };

    const { circleBlurOnInactive, circleOpacity, connectingPathTrim, groupTransform, pathBlurOnInactive, pathTrim, labelOpacity } =
        useHandleTreeAnimations(selectedNode, showLabel, tree, findDistanceBetweenNodesById(wholeTree, tree.data.id) ?? 0);

    const nodeAndParentCompleted = (() => {
        if (tree.data.isCompleted !== true) return false;

        const parentNode = findParentOfNode(wholeTree, tree.data.id);

        if (!parentNode) return false;

        if (parentNode.data.isCompleted !== true) return false;

        return true;
    })();

    return (
        <>
            {!tree.isRoot && (
                <Path
                    path={createBezierPathBetweenPoints(pathInitialPoint, { x: cx, y: cy })}
                    color={nodeAndParentCompleted ? `${colors.accent}3D` : colors.line}
                    style="stroke"
                    strokeCap={"round"}
                    strokeWidth={3}
                    end={connectingPathTrim}>
                    <Blur blur={pathBlurOnInactive} />
                </Path>
            )}
            {/* Recursive fucntion that renders the rest of the tree */}
            {tree.children &&
                tree.children.map((element, idx) => {
                    return (
                        <CanvasTree
                            key={idx}
                            tree={element}
                            wholeTree={wholeTree}
                            parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                        />
                    );
                })}

            {showLabel && <Label tree={tree} coord={{ cx, cy }} labelOpacity={labelOpacity} pathBlurOnInactive={pathBlurOnInactive} />}

            <Node
                circleBlurOnInactive={circleBlurOnInactive}
                circleOpacity={circleOpacity}
                tree={tree}
                coord={{ cx, cy }}
                currentNodeCoordintes={currentNodeCoordintes}
                groupTransform={groupTransform}
                pathTrim={pathTrim}
                selectedNode={selectedNode}
            />
        </>
    );
}
export default CanvasTree;
