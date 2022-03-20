
export function formatUrl(path:string, ignoreTrailingSlash:boolean) {
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