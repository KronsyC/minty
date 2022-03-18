"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Radix tree based routing
class TrieNode {
    /**
     *
     * @param router An Instance of a Router
     * @param name The Name of the route segment
     * @param handlers An Object Representing the mappings of HTTP methods to The Chosen Handler Type
     */
    constructor(router, name, options = {}) {
        this.rootNode = false;
        /**
         * This is some metadata which tells the router wether to allow
         * the user to overwrite the specific route or throw an error
         *
         * defaults to false
         */
        this.overridable = false;
        this.router = router;
        this.children = [];
        this.name = name;
        const handlers = options.handlers;
        if (handlers) {
            this.terminal = true;
            this.handlers = handlers;
        }
        else {
            this.terminal = false;
        }
        if (options.overridable) {
            this.overridable = true;
        }
    }
    extractPath(path) {
        let list = [];
        let tmp = '';
        for (let char of path) {
            if (this.router['parameterSeparators'].includes(char)) {
                list.push(tmp);
                list.push(char);
                tmp = '';
            }
            else {
                tmp += char;
            }
        }
        if (tmp) {
            list.push(tmp);
        }
        return list;
    }
    routePartsMatch(routeParts, templateParts) {
        if (routeParts.length === templateParts.length) {
            for (let i = 0; i < routeParts.length; i++) {
                let routePart = routeParts[i];
                let templatePart = templateParts[i];
                if (!templatePart.startsWith(':') &&
                    routePart !== templatePart) {
                    return false;
                }
            }
        }
        else {
            return false;
        }
        return true;
    }
    isMatch(route, template) {
        // Check if two route segments match
        if (!this.router['parameterSeparators']
            .map((s) => template.includes(s))
            .includes(true)) {
            if (template.startsWith(':')) {
                return true;
            }
        }
        else {
            const routeParts = this.extractPath(route);
            const templateParts = this.extractPath(template);
            let matches = this.routePartsMatch(routeParts, templateParts);
            return matches;
        }
        return false;
    }
    addChild(node) {
        this.children.push(node);
    }
    /**
     *
     * @param name
     * @param exact This parameter prevents pattern matching
     * @returns The actual name of the handler or undefined
     */
    hasChild(name, exact = false) {
        let childrenNames = this.children.map((c) => c.name);
        if (childrenNames.includes(name)) {
            return name;
        }
        for (const template of childrenNames) {
            // Only operate on dynamic paths
            if (template.includes(':') && !exact) {
                const matches = this.isMatch(name, template);
                if (matches) {
                    return template;
                }
            }
        }
        return undefined;
    }
    getChild(name) {
        // Moves catchall routes to the end of the array, i.e lowest priority
        for (const child of this.children) {
            if (!(child.name.includes('+') || child.name.includes('-')) &&
                child.name.startsWith(':')) {
                const e = this.children.splice(this.children.indexOf(child), 1)[0];
                this.children.push(e);
            }
        }
        const childrenNames = this.children.map((c) => c.name);
        if (childrenNames.includes(name)) {
            for (const child of this.children) {
                if (child.name === name) {
                    return child;
                }
            }
        }
        else {
            for (const child of this.children) {
                if (child.name.includes(':')) {
                    const doRoutesMatch = this.isMatch(name, child.name);
                    if (doRoutesMatch) {
                        return child;
                    }
                }
            }
        }
        return this;
    }
    hasTerminalChild() {
        let childNames = this.children.map((c) => c.terminal);
        return childNames.includes(true);
    }
    addHandler(method, handler) {
        let currentHandlers = this.handlers || {};
        currentHandlers[method] = handler;
        this.handlers = currentHandlers;
        this.terminal = true;
    }
    getHandler(method) {
        let _handler = undefined;
        if (this.handlers) {
            _handler = this.handlers[method];
            // The ALL method is a backup in the case
            // That there is no specific handler for the
            // method
            if (!_handler) {
                _handler = this.handlers["ALL"];
            }
        }
        return _handler;
    }
}
exports.default = TrieNode;
//# sourceMappingURL=TrieNode.js.map