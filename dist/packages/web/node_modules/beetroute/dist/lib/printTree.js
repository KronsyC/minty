"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
function printTree(initialTree, printNode, getChildren) {
    function printBranch(tree, branch) {
        const isGraphHead = branch.length === 0;
        const children = getChildren(tree) || [];
        let branchHead = '';
        if (!isGraphHead) {
            branchHead = children && children.length !== 0 ? '┬ ' : '─ ';
        }
        const toPrint = printNode(tree, `${branch}${branchHead}`);
        if (typeof toPrint === 'string') {
            console.log(`${branch}${branchHead}${toPrint}`);
        }
        let baseBranch = branch;
        if (!isGraphHead) {
            const isChildOfLastBranch = branch.slice(-2) === '└─';
            baseBranch = branch.slice(0, -2) + (isChildOfLastBranch ? '  ' : '│ ');
        }
        const nextBranch = baseBranch + '├─';
        const lastBranch = baseBranch + '└─';
        children.forEach((child, index) => {
            printBranch(child, children.length - 1 === index ? lastBranch : nextBranch);
        });
    }
    printBranch(initialTree, '');
}
exports.default = printTree;
//# sourceMappingURL=printTree.js.map