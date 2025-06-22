// 额外的JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 为代码块添加复制按钮功能增强
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(function(block) {
        // 添加行号显示
        if (block.textContent.split('\n').length > 3) {
            block.classList.add('line-numbers');
        }
    });

    // 为表格添加响应式滚动
    const tables = document.querySelectorAll('table');
    tables.forEach(function(table) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 添加返回顶部按钮功能增强
    const backToTop = document.querySelector('.md-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
            } else {
                backToTop.style.opacity = '0.7';
            }
        });
    }

    // 为重要提示添加动画效果
    const admonitions = document.querySelectorAll('.admonition');
    admonitions.forEach(function(admonition) {
        admonition.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
        
        admonition.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});

// 打印功能
function printPage() {
    window.print();
}

// 全屏切换功能
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
} 