"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUrl = void 0;
function formatUrl(path, ignoreTrailingSlash) {
    if (path.startsWith('/')) {
        path = path.slice(1);
    }
    if (path.endsWith('/') && ignoreTrailingSlash) {
        path = path.slice(0, path.length - 1);
    }
    const parts = path.split('/');
    parts.forEach((part, index) => {
        if (part === '') {
            parts.splice(index, 1);
        }
    });
    return parts.join('/');
}
exports.formatUrl = formatUrl;
//# sourceMappingURL=urlFormatter.js.map