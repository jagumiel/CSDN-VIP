// ==UserScript==
// @name         100%解锁CSDN文库vip文章阅读限制
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  CSDN文库阅读全文，去除VIP文章遮罩
// @author       Mrlimuyu
// @match        *://*.csdn.net/*
// @grant        none
// @license      yagiza
// @downloadURL https://update.greasyfork.org/scripts/495150/100%25%E8%A7%A3%E9%94%81CSDN%E6%96%87%E5%BA%93vip%E6%96%87%E7%AB%A0%E9%98%85%E8%AF%BB%E9%99%90%E5%88%B6.user.js
// @updateURL https://update.greasyfork.org/scripts/495150/100%25%E8%A7%A3%E9%94%81CSDN%E6%96%87%E5%BA%93vip%E6%96%87%E7%AB%A0%E9%98%85%E8%AF%BB%E9%99%90%E5%88%B6.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const PAYWALL_SELECTORS = [
        '.hide-article-box',
        '.article-mask',
        '.content-hide',
        '.content-mask',
        '.vip-caise',
        '.passport-login-tip-container',
        '.passport-login-container',
        '.login-mark',
        '.mask',
        '.hljs-button.signin',
        '.look-more-preCode',
        '.hide-preCode-box'
    ];

    const CONTENT_SELECTORS = [
        '.article_content',
        '.article-content',
        '.article_content.clearfix',
        '.blog-content-box',
        '#content_views',
        '.markdown_views'
    ];

    const BUTTON_TEXTS = ['展开阅读全文', '阅读全文', '继续阅读', '展开', '查看全文'];

    const removePaywall = () => {
        document.querySelectorAll(PAYWALL_SELECTORS.join(',')).forEach(el => el.remove());

        // 兜底：移除常见付费/隐藏覆盖层（即使类名变化）
        document.querySelectorAll('[class]').forEach(el => {
            const cls = (el.className || '').toString().toLowerCase();
            if (/(mask|hide|vip|login|readmore|unlogin|passport)/.test(cls) && el.childElementCount <= 8) {
                const text = (el.textContent || '').trim();
                if (!text || /展开|阅读|登录|VIP|继续/.test(text)) {
                    el.remove();
                }
            }
        });
    };

    const expandArticle = () => {
        document.querySelectorAll(CONTENT_SELECTORS.join(',')).forEach(container => {
            container.style.maxHeight = 'none';
            container.style.height = 'auto';
            container.style.overflow = 'visible';
            container.classList.remove('hide-article-box');
        });

        // 新版页面常见限制属性
        document.querySelectorAll('[style*="max-height"], [style*="overflow: hidden"]').forEach(el => {
            if (el.scrollHeight > 300 && el.clientHeight < el.scrollHeight) {
                el.style.maxHeight = 'none';
                el.style.height = 'auto';
                el.style.overflow = 'visible';
            }
        });
    };

    const clickReadMore = () => {
        document.querySelectorAll('button, a, span, div').forEach(el => {
            const text = (el.textContent || '').trim();
            if (BUTTON_TEXTS.includes(text)) {
                el.click();
            }
        });
    };

    const enableCopy = () => {
        document.oncopy = null;
        document.oncut = null;
        document.onselectstart = null;
        document.oncontextmenu = null;
        document.body && (document.body.oncopy = null);
        document.body && (document.body.onselectstart = null);

        document.querySelectorAll('*').forEach(el => {
            el.style.userSelect = 'text';
            el.style.webkitUserSelect = 'text';
            el.style.msUserSelect = 'text';
            el.style.mozUserSelect = 'text';
            el.oncopy = null;
            el.onselectstart = null;
            el.oncontextmenu = null;
        });
    };

    const unlock = () => {
        removePaywall();
        expandArticle();
        clickReadMore();
        enableCopy();
    };

    const observer = new MutationObserver(unlock);

    const start = () => {
        unlock();
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
        // 防止异步渲染后再次加锁
        setInterval(unlock, 1200);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
