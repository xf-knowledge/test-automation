// KaTeX 数学公式渲染配置
document.addEventListener("DOMContentLoaded", function() {
    renderMathInElement(document.body, {
        // 自定义分隔符
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
        ],
        // 渲染选项
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: false,
        // 忽略的标签和类
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoredClasses: ['no-math']
    });
}); 