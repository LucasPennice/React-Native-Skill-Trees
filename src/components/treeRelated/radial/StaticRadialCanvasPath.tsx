import { CanvasDimensions, NodeCoordinate } from "@/types";
import { Picture, Skia, createPicture } from "@shopify/react-native-skia";
import { memo, useMemo } from "react";
import { getCurvedPath } from "./RadialCanvasPath";

export const StaticRadialPathList = memo(function StaticRadialPathList({
    staticNodes,
    allNodes,
    canvasDimensions,
}: {
    staticNodes: NodeCoordinate[];
    allNodes: NodeCoordinate[];
    canvasDimensions: CanvasDimensions;
}) {
    // Create picture
    const picture = useMemo(
        () =>
            createPicture({ x: 0, y: 0, width: canvasDimensions.canvasWidth, height: canvasDimensions.canvasHeight }, (canvas) => {
                const rootNodeCoordinates = allNodes.find((c) => c.level === 0);
                if (!rootNodeCoordinates) throw new Error("rootNodeCoordinates not found at StaticRadialPathList createPicture");

                const paint = Skia.Paint();
                paint.setColor(Skia.Color("#1C1C1D"));

                for (const nodeCoordinate of staticNodes) {
                    if (nodeCoordinate.isRoot) continue;
                    const parentNode = allNodes.find((n) => n.nodeId === nodeCoordinate.parentId);

                    if (!parentNode) throw new Error("parentNode not found at StaticRadialPathList createPicture");

                    const p1x = nodeCoordinate.x;
                    const p1y = nodeCoordinate.y;

                    const centerOfNode = { x: p1x, y: p1y };

                    if (!rootNodeCoordinates) return <></>;
                    const { c, m } = getCurvedPath(rootNodeCoordinates, parentNode, centerOfNode);
                    const path = Skia.Path.Make();
                    path.moveTo(m.x, m.y);
                    path.cubicTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);

                    path.stroke({ width: 2 });

                    canvas.drawPath(path, paint);
                }
            }),
        [allNodes, staticNodes, canvasDimensions]
    );

    return <Picture picture={picture} />;
});
