import { StyleProp, ViewStyle } from "react-native/types";

export type Skill = {
    name: string;
    id: string;
    parentId?: string;
    isRoot?: boolean;
    isCompleted?: boolean;
};

export interface Tree<T> {
    treeId?: string;
    treeName?: string;
    data: T;
    children?: Tree<T>[];
}

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const treeMock: Tree<Skill> = {
    treeId: "HPTREE",
    treeName: "HPTREE",
    data: { id: `Harry Potter 1`, name: "Harry Potter 1", isRoot: true },
    children: [
        {
            data: { id: `Harry Potter 2`, name: "Harry Potter 2" },
            children: [
                {
                    data: { id: `Harry Potter 3`, name: "Harry Potter 3" },
                    children: [
                        { data: { id: `Harry Potter 41`, name: "Harry Potter 41" } },
                        { data: { id: `Harry Potter 42`, name: "Harry Potter 42" } },
                        { data: { id: `Harry Potter 43`, name: "Harry Potter 43" } },
                    ],
                },
            ],
        },
        {
            data: { id: "Harry Potter 2.5", name: "Harry Potter 2.5" },
            children: [
                {
                    data: { id: "Harry Potter 2.5 child", name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};

export const mockSkillTreeArray: Tree<Skill>[] = [
    {
        treeId: "IQ Skills",
        treeName: "IQ Skills",
        data: { id: `Coding`, name: "Coding", isRoot: true, isCompleted: true },
        children: [
            {
                data: { id: `Management`, name: "Management", parentId: "Coding" },

                children: [
                    {
                        data: { id: `Lead Gen`, name: "Lead Gen", parentId: "Management" },

                        children: [
                            {
                                data: { id: `Strategy`, name: "Strategy", parentId: "Lead Gen" },
                                children: [{ data: { id: "Cashflow Management", name: "Cashflow Management", parentId: "Strategy" } }],
                            },
                        ],
                    },
                ],
            },
            {
                data: { id: "English", name: "English", parentId: "Coding" },

                children: [
                    {
                        data: {
                            isCompleted: true,
                            parentId: "English",
                            id: "Public Speaking",
                            name: "Public Speaking",
                        },
                        children: [
                            {
                                data: { name: "Sales", id: "Sales", parentId: "Public Speaking" },
                                children: [{ data: { id: "Leadership", name: "Leadership", parentId: "Sales" } }],
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
        data: { id: `People Management`, name: "People Management", isRoot: true, isCompleted: true },
        children: [
            {
                data: { id: `Confidence`, name: "Confidence", parentId: "People Management" },
            },
            {
                data: { id: "Energy Investments", name: "Energy Investments", parentId: "People Management", isCompleted: true },
                children: [
                    {
                        data: { id: `Copywriting`, name: "Copywriting", parentId: "Energy Investments" },
                    },
                ],
            },
        ],
    },
];

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };
