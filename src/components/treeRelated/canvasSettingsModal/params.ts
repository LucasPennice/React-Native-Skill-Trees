import { nodeGradients } from "../../../parameters";
import { Skill, Tree, getDefaultSkillValue } from "../../../types";

export const CanvasSettingsMockNode: Tree<Skill> = {
    accentColor: nodeGradients[5],
    category: "SKILL",
    children: [],
    data: getDefaultSkillValue("Example", true, { isEmoji: true, text: "🗿" }),
    isRoot: true,
    level: 0,
    nodeId: "exampleNodeId",
    parentId: null,
    treeId: "exampleTreeId",
    treeName: "exampleTreeName",
    x: 0,
    y: 0,
};

export const CanvasSettingsNodeSize = 57;
