import postcss from 'postcss';

function parse(string) {
    const result = string.match(/^#\s*BACKGROUND\s+(\w+)\s*#$/);
    if (result === null) return null;
    return result[1];
}

export default postcss.plugin('postcss-replace-background', (opts={}) => (css, result) => {
    const images = opts;
    css.walkRules(rule => {
        const decls = [];
        rule.walkDecls('background-image', decl => decls.push(decl));
        rule.walkComments(comment => {
            const key = parse(comment.text);
            if (key === null || images[key] == undefined) return;
            decls.forEach(decl => decl.value = `url(${images[key]})`);
        });
    });
});
