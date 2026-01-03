import { visit } from 'unist-util-visit';

export function relativeAssetsPlugin() {
    return (tree: any) => {
        visit(tree, 'image', (node: any) => {
            if (node.url && node.url.startsWith('./')) {
                const url = node.url;
                // Transform the node into an MDX expression that imports the image
                // We replace the image node with an HTML img tag where src is the imported variable

                // Generate a unique variable name based on the path (simplified)
                const variableName = `img_${url.replace(/[\.\/]/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;

                // Use a simpler approach complying with how Analog/Vite handles this:
                // Actually, just transforming it to an import isn't enough in the AST unless we inject the import.
                // A common pattern is to leave it to Vite's asset handling if we can, but MDX needs help.

                // Let's implement the standard pattern:
                // 1. Add an import statement to the top of the file (conceptually)
                // 2. 

                // However, for simplicity and robustness with standard remark/vite setups:
                // We will transform the node to a directive or keep it as is if vite-imagetools or similar picks it up.
                // But the user request specifically asked: "ensure Vite handles and hashes images".
                // The standard way in MDX is to use an import.

                // Since manipulating the AST to inject imports is complex without `unist-util-visit` on the root, 
                // we'll try a simpler robust approach: transform the `image` node to a `mdxJsxFlowElement` or `html` 
                // that uses `new URL('...', import.meta.url).href`. 

                // WAIT, the user instructions were specific: 
                // "images relative paths (start with ./) -> convert to JS import, replace img src with variable"

                // This usually requires injecting an import node into the tree.
                // Let's rely on the fact that we can mutate the tree.

                // NOTE: Since we are in a Remark plugin, we are dealing with MDAST.
                // To inject imports, we usually need to assume the tree handles MDX nodes (mdast-util-mdx).

                // Let's assume standard behavior:

                // Direct mutation approach (simplified for standard MDX pipeliens):
                // 1. Identify relative images.
                // 2. Change them to JSX `<img src={importedImage} ... />`
                // 3. Inject `import importedImage from './path/to/img.png'`

                // Implementation:
                const importPath = node.url;
                const importName = `__img_${importPath.replace(/[^a-zA-Z0-9]/g, '_')}`;

                // We need to add the import to the root.
                // But `visit` visits deep nodes. We need context of the root.
                // But here we'll just modify the node and assume we can prepend imports later?
                // No, we should visit the ROOT first to get a reference to the body/imports.

                // BETTER APPROACH:
                // Use `new URL(path, import.meta.url).href` if the environment supports it (Vite does).
                // node.type = 'mdxJsxFlowElement';
                // node.name = 'img';
                // node.attributes = [
                //   { type: 'mdxJsxAttribute', name: 'src', value: { type: 'mdxJsxAttributeValueExpression', value: `new URL('${url}', import.meta.url).href` } },
                //   { type: 'mdxJsxAttribute', name: 'alt', value: node.alt }
                // ];

                // OR adhering strictly to "convert to JavaScript import":
                // This requires finding the root node to push imports.
            }
        });

        // To properly handle imports, we need a second pass or access to root.
        // Let's do it properly.
        let imports: any[] = [];

        visit(tree, 'image', (node: any) => {
            if (node.url && node.url.startsWith('./')) {
                const importName = `__img_${Math.random().toString(36).substring(7)}`;
                imports.push({
                    type: 'mdxjsEsm',
                    value: `import ${importName} from "${node.url}";`,
                    data: {
                        estree: {
                            type: 'Program',
                            body: [{
                                type: 'ImportDeclaration',
                                specifiers: [{
                                    type: 'ImportDefaultSpecifier',
                                    local: { type: 'Identifier', name: importName }
                                }],
                                source: { type: 'Literal', value: node.url }
                            }],
                            sourceType: 'module'
                        }
                    }
                });

                // Transform this node to an MDX JSX element (<img>) using the variable
                node.type = 'mdxJsxFlowElement';
                node.name = 'img';
                node.children = [];
                node.attributes = [
                    {
                        type: 'mdxJsxAttribute', name: 'src', value: {
                            type: 'mdxJsxAttributeValueExpression',
                            value: importName,
                            data: {
                                estree: {
                                    type: 'Program',
                                    body: [{
                                        type: 'ExpressionStatement',
                                        expression: { type: 'Identifier', name: importName }
                                    }],
                                    sourceType: 'module'
                                }
                            }
                        }
                    },
                    { type: 'mdxJsxAttribute', name: 'alt', value: node.alt || '' }
                ];

                // Copy other properties if needed (title, etc)
                if (node.title) {
                    node.attributes.push({ type: 'mdxJsxAttribute', name: 'title', value: node.title });
                }
            }
        });

        if (imports.length > 0) {
            tree.children.unshift(...imports);
        }
    };
}
