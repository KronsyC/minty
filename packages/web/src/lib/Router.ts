import { Method } from '@mintyjs/http';
import printTree from './printTree';

export const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'TRACE',
  'HEAD',
  'CONNECT',
];
// Radix tree based routing based heavily off of fastify's router
class TrieNode {
  terminal: boolean; // Is this node the end of a path
  children: TrieNode[];
  handler?: Function;
  value?: any;
  name: string;

  private isMatch(route: string, template: string): boolean {
    function extractPath(path: string): string[] {
      let list = [];
      let tmp: string = '';
      for (let char of path) {
        if (char === '+' || char === '-') {
          list.push(tmp);
          list.push(char);
          tmp = '';
        } else {
          tmp += char;
        }
      }
      if (tmp) {
        list.push(tmp);
      }
      return list;
    }
    function routePartsMatch(
      routeParts: string[],
      templateParts: string[]
    ): boolean {
      if (routeParts.length === templateParts.length) {
        for (let i = 0; i < routeParts.length; i++) {
          let routePart = routeParts[i];
          let templatePart = templateParts[i];

          if (!templatePart.startsWith(':') && routePart !== templatePart) {
            return false;
          }
        }
      } else {
        return false;
      }
      return true
    }

    // Check if two route segments match

    if (!(template.includes('+') || template.includes('-'))) {
      if (template.startsWith(':')) {
        return true;
      }
    } else {
      const routeParts = extractPath(route);
      const templateParts = extractPath(template);

      let matches = routePartsMatch(routeParts, templateParts);
      console.log(matches);

      return matches;
    }
    console.log(false);

    return false;
  }
  constructor(name: string, terminal: boolean, handler?: Function) {
    this.children = [];
    this.name = name;
    this.terminal = terminal;

    if (!terminal && handler) {
      throw new Error('Cannot have handler on non-terminal node');
    } else if (terminal && handler) {
      this.handler = handler;
    }
  }
  addChild(node: TrieNode) {
    this.children.push(node);
  }
  hasChild(name: string, exact: boolean = false) {
    let childrenNames = this.children.map((c) => c.name);

    for (const nam of childrenNames) {
      // Only operate on dynamic paths
      if (!exact) {
        if (nam.includes(':')) {
          const matches = this.isMatch(name, nam);
          if (matches) {
            return true;
          }
        }
      }
    }
    return childrenNames.includes(name);
  }
  getChild(name: string, exact: boolean = false): TrieNode {
    const childrenNames = this.children.map((c) => c.name);

    if (childrenNames.includes(name)) {
      for (const child of this.children) {
        if (child.name === name) {
          return child;
        }
      }
    } else {
      for (const child of this.children) {
        if (child.name.includes(':')) {
          const doRoutesMatch = this.isMatch(name, child.name);
          if (doRoutesMatch) {
            console.log(`${name} resolves to ${child.name}`);

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
}

// Small utility function to trim trailing and leading slashes
function trimPath(path: string) {
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  if (path.endsWith('/')) {
    path = path.slice(0, path.length - 1);
  }
  return path;
}
export default class Router {
  private radixTree: TrieNode; // The root node of the tree
  constructor(config: any) {
    this.radixTree = new TrieNode('root', false);
  }

  addRoute(path: string, method: Method, handler: Function) {

    path = trimPath(path);
    const location = path.split('/');
    location.push(method); // Paths will look like this /foo/bar/baz/_method
    let currentNode: TrieNode = this.radixTree;
    location.forEach((part, index) => {
      if (currentNode.hasChild(part, true)) {
        currentNode = currentNode.getChild(part, true);

        // if it's the last child, set it as a terminal and add method
        if (index === location.length - 1) {
          currentNode.terminal = true;
          currentNode.handler = handler;
          currentNode.value;
        }
      } else {
        // If last part, generate terminal and add methods
        if (index === location.length - 1) {
          currentNode.addChild(new TrieNode(part, true, handler));
        } else {
          // Generate empty node

          currentNode.addChild(new TrieNode(part, false));
        }
        currentNode = currentNode.getChild(part);
      }
    });
  }

  /**
   *
   * @description Gets the handler associated with an action
   * @summary
   * Takes a path and method, and returns a handler
   * - Throws ERR_METHOD_NOT_ALLOWED if the route does not support the specified method
   * - Throws ERR_NOT_FOUND if the route doesn't have any handlers
   *
   * @param path The path you want to fetch a handler for
   * @param method The HTTP method of the route
   *
   */
  find(path: string, method: Method) {

    function thisShouldNotBeRun() {
      console.log('ERROR');
    }
    path = trimPath(path) + '/' + method;
    const parts = path.split('/');

    let current = this.radixTree;
    let handler: Function = thisShouldNotBeRun;

    parts.forEach((part, index) => {
      if (current.hasChild(part)) {
        current = current.getChild(part);
        // If this is the last path part, return the handler
        if (index === parts.length - 1) {
          handler = current.handler || thisShouldNotBeRun;
        }
      } else {
        // selected method has no handler
        if (index === parts.length - 1) {
          if (current.hasTerminalChild()) {
            throw new Error('ERR_METHOD_NOT_ALLOWED');
          }
        }
        throw new Error('ERR_NOT_FOUND');
      }
    });
    return handler;
  }
}
