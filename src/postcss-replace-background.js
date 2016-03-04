const postcss = require('postcss');

function parse(string) {
    let result = string.match(/^#\s*BACKGROUND\s+(\w+)\s*#$/);
    if (result === null) return null;
    return result[1];
}

module.exports = postcss.plugin('postcss-remove', (opts={}) => (css, result) => {
    let images = opts;
    css.walkRules(rule => {
        let decls = [];
        rule.walkDecls('background-image', decl => decls.push(decl));
        rule.walkComments(comment => {
            let key = parse(comment.text);
            if (key === null || images[key] == undefined) return;
            decls.forEach(decl => decl.value = `url(${images[key]})`);
        });
    });
});
