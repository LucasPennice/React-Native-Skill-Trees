import { CanvasDimensions, NodeCoordinate } from "@/types";
import { Picture, Skia, createPicture } from "@shopify/react-native-skia";
import { memo, useMemo } from "react";
import { getCurvedPath } from "./RadialCanvasPath";

export const StaticRadialPathList = memo(function StaticRadialPathList({
    nodeCoordinates,
    canvasDimensions,
}: {
    nodeCoordinates: NodeCoordinate[];
    canvasDimensions: CanvasDimensions;
}) {
    // Create picture
    const picture = useMemo(
        () =>
            createPicture({ x: 0, y: 0, width: canvasDimensions.canvasWidth, height: canvasDimensions.canvasHeight }, (canvas) => {
                const rootNodeCoordinates = nodeCoordinates.find((c) => c.level === 0);
                if (!rootNodeCoordinates) throw new Error("rootNodeCoordinates not found at StaticRadialPathList createPicture");

                const paint = Skia.Paint();
                paint.setColor(Skia.Color("#1C1C1D"));

                for (const nodeCoordinate of nodeCoordinates) {
                    if (nodeCoordinate.isRoot) continue;
                    const parentNode = nodeCoordinates.find((n) => n.nodeId === nodeCoordinate.parentId);

                    if (!parentNode) throw new Error("parentNode not found at StaticRadialPathList createPicture");

                    const p1x = nodeCoordinate.x;
                    const p1y = nodeCoordinate.y;

                    const centerOfNode = { x: p1x, y: p1y };

                    if (!rootNodeCoordinates) return <></>;
                    const { p: path } = getCurvedPath(rootNodeCoordinates, parentNode, centerOfNode);
                    path.stroke({ width: 2 });

                    canvas.drawPath(path, paint);
                }
            }),
        [nodeCoordinates, canvasDimensions]
    );

    return <Picture picture={picture} />;
});
