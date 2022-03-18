declare type PrintNode<T> = (node: T, branch: string) => string;
declare type GetChildren<T> = (node: T) => Array<T>;
declare function printTree<T>(initialTree: T, printNode: PrintNode<T>, getChildren: GetChildren<T>): void;
export default printTree;
