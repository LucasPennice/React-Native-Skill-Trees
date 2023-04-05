import { Blur, Path, Skia, useComputedValue, useSpring } from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CANVAS_SPRING, colors, MAX_OFFSET } from "./parameters";
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
    treeAccentColor: string;
};

function CanvasTree({ tree, parentNodeInfo, stateProps, rootCoordinates: rC, wholeTree, treeAccentColor }: TreeProps) {
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

    const p1x = useSpring(cx, CANVAS_SPRING);
    const p1y = useSpring(cy, CANVAS_SPRING);

    const p2x = useSpring(pathInitialPoint.x, CANVAS_SPRING);
    const p2y = useSpring(pathInitialPoint.y, CANVAS_SPRING);

    const path = useComputedValue(() => {
        const p = Skia.Path.Make();

        p.moveTo(p1x.current, p1y.current);

        // mid-point of line:
        var mpx = (p2x.current + p1x.current) * 0.5;
        var mpy = (p2y.current + p1y.current) * 0.5;

        // angle of perpendicular to line:
        var theta = Math.atan2(p2y.current - p1y.current, p2x.current - p1x.current) - Math.PI / 2;

        let deltaX = p2x.current - p1x.current;

        // distance of control point from mid-point of line:
        var offset = deltaX > MAX_OFFSET ? MAX_OFFSET : deltaX < -MAX_OFFSET ? -MAX_OFFSET : deltaX;

        // location of control point:
        var c1x = mpx + offset * 1.5 * Math.cos(theta);
        var c1y = mpy + offset * 1.5 * Math.sin(theta);

        p.quadTo(c1x, c1y, p2x.current, p2y.current);

        return p;
    }, [p1x, p1y, p2x, p2y]);

    return (
        <>
            {!tree.isRoot && (
                <Path
                    path={path}
                    color={nodeAndParentCompleted ? `${treeAccentColor}3D` : colors.line}
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
                            treeAccentColor={treeAccentColor}
                            parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                        />
                    );
                })}

            {showLabel && (
                <Label
                    treeAccentColor={treeAccentColor}
                    tree={tree}
                    coord={{ cx, cy }}
                    labelOpacity={labelOpacity}
                    pathBlurOnInactive={pathBlurOnInactive}
                />
            )}

            <Node
                circleBlurOnInactive={circleBlurOnInactive}
                circleOpacity={circleOpacity}
                tree={tree}
                treeAccentColor={treeAccentColor}
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
