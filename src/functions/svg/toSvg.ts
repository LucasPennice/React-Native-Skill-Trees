import { CIRCLE_SIZE } from "@/parameters";
import { CartesianCoordinate } from "@/types";

export function nodeToCircularPath<T extends CartesianCoordinate>(node: T, rad = CIRCLE_SIZE) {
    return `M ${rad + node.x} ${node.y} a ${rad} ${rad} 0 1 0 ${-2 * rad} 0 ${rad} ${rad} 0 1 0 ${2 * rad} 0`;
}
