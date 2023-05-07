import { Skill, Tree } from "../types";

export function makeid(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function createTree(treeName: string, color: string, isRoot: boolean, data: Skill) {
    const result: Tree<Skill> = {
        treeName: treeName.trim(),
        accentColor: color,
        isRoot,
        parentId: null,
        treeId: makeid(24),
        level: 0,
        nodeId: makeid(24),
        children: [],
        x: 0,
        y: 0,
        data: { name: data.name.trim(), isCompleted: data.isCompleted },
    };

    return result;
}

export function interpolateColors(color1: string, color2: string, percent: number) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    // Convert the interpolated RGB values back to a hex color
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
