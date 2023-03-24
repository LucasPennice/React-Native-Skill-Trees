import { StyleProp, ViewStyle } from "react-native/types";

export type Skill = {
    name: string;
    id: string;
    isCompleted?: boolean;
};

export interface Tree<T> {
    isRoot?: boolean;
    parentId: string | undefined;
    treeId?: string;
    treeName?: string;
    data: T;
    children?: Tree<T>[];
}

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const mockSkillTreeArray: Tree<Skill>[] = [
    {
        treeId: "IQ Skills",
        treeName: "IQ Skills",
        isRoot: true,
        parentId: undefined,
        data: { id: `Coding`, name: "Coding", isCompleted: true },
        children: [
            {
                parentId: "Coding",
                data: { id: `Management`, name: "Management" },
                children: [
                    {
                        data: { id: `Lead Gen`, name: "Lead Gen" },
                        parentId: "Management",
                        children: [
                            {
                                parentId: "Lead Gen",
                                data: { id: `Strategy`, name: "Strategy" },
                                children: [{ data: { id: "Cashflow Management", name: "Cashflow Management" }, parentId: "Strategy" }],
                            },
                        ],
                    },
                ],
            },
            {
                data: { id: "English", name: "English" },
                parentId: "Coding",
                children: [
                    {
                        parentId: "English",
                        data: {
                            isCompleted: true,
                            id: "Public Speaking",
                            name: "Public Speaking",
                        },
                        children: [
                            {
                                data: { name: "Sales", id: "Sales" },
                                parentId: "Public Speaking",
                                children: [{ data: { id: "Leadership", name: "Leadership" }, parentId: "Sales" }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        treeId: "EQ Skills",
        treeName: "EQ Skills",
        isRoot: true,
        parentId: undefined,
        data: { id: `People Management`, name: "People Management", isCompleted: true },
        children: [
            {
                data: { id: `Confidence`, name: "Confidence" },
                parentId: "People Management",
            },
            {
                data: { id: "Energy Investments", name: "Energy Investments", isCompleted: true },
                parentId: "People Management",
                children: [
                    {
                        data: { id: `Copywriting`, name: "Copywriting" },
                        parentId: "Energy Investments",
                    },
                ],
            },
        ],
    },
];

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };
