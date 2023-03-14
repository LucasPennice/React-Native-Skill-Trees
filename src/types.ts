export type Book = {
    name: string;
    id: string;
};

export interface TreeNode<T> {
    node: T;
    children?: TreeNode<T>[];
    isRoot?: boolean;
}

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const treeMock: TreeNode<Book> = {
    isRoot: true,
    node: { id: `Harry Potter 1`, name: "Harry Potter 1" },
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
