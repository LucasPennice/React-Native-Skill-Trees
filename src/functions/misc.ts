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
        parentId: undefined,
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
