import { StyleProp, ViewStyle } from "react-native/types";

export type Book = {
    name: string;
    id: string;
    parentId?: string;
    isRoot?: boolean;
    isCompleted?: boolean;
};

export interface TreeNode<T> {
    treeId?: string;
    treeName?: string;
    node: T;
    children?: TreeNode<T>[];
}

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const treeMock: TreeNode<Book> = {
    treeId: "HPTREE",
    treeName: "HPTREE",
    node: { id: `Harry Potter 1`, name: "Harry Potter 1", isRoot: true },
    children: [
        {
            node: { id: `Harry Potter 2`, name: "Harry Potter 2" },
            children: [
                {
                    node: { id: `Harry Potter 3`, name: "Harry Potter 3" },
                    children: [
                        { node: { id: `Harry Potter 41`, name: "Harry Potter 41" } },
                        { node: { id: `Harry Potter 42`, name: "Harry Potter 42" } },
                        { node: { id: `Harry Potter 43`, name: "Harry Potter 43" } },
                    ],
                },
            ],
        },
        {
            node: { id: "Harry Potter 2.5", name: "Harry Potter 2.5" },
            children: [
                {
                    node: { id: "Harry Potter 2.5 child", name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};

export const mockSkillTreeArray: TreeNode<Book>[] = [
    {
        treeId: "IQ Skills",
        treeName: "IQ Skills",
        node: { id: `Coding`, name: "Coding", isRoot: true, isCompleted: true },
        children: [
            {
                node: { id: `Management`, name: "Management", parentId: "Coding" },

                children: [
                    {
                        node: { id: `Lead Gen`, name: "Lead Gen", parentId: "Management" },

                        children: [
                            {
                                node: { id: `Strategy`, name: "Strategy", parentId: "Lead Gen" },
                                children: [{ node: { id: "Cashflow Management", name: "Cashflow Management", parentId: "Strategy" } }],
                            },
                        ],
                    },
                ],
            },
            {
                node: { id: "English", name: "English", parentId: "Coding" },

                children: [
                    {
                        node: {
                            isCompleted: true,
                            parentId: "English",
                            id: "Public Speaking",
                            name: "Public Speaking",
                        },
                        children: [
                            {
                                node: { name: "Sales", id: "Sales", parentId: "Public Speaking" },
                                children: [{ node: { id: "Leadership", name: "Leadership", parentId: "Sales" } }],
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
        node: { id: `People Management`, name: "People Management", isRoot: true, isCompleted: true },
        children: [
            {
                node: { id: `Confidence`, name: "Confidence", parentId: "People Management" },
            },
            {
                node: { id: "Energy Investments", name: "Energy Investments", parentId: "People Management", isCompleted: true },
                children: [
                    {
                        node: { id: `Copywriting`, name: "Copywriting", parentId: "Energy Investments" },
                    },
                ],
            },
        ],
    },
];

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };
