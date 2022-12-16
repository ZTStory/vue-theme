// 异步加载时的 BASE_URL，可本地与远程
const BASE_URL = import.meta.env.BASE_URL;
// 异步加载主题的命名规则
const ASYNC_LOAD_THEME_RULE = ".variable.css";
// body 上额外扩展的属性名
const THEME_MODE_ATTR = "theme-mode";
// 默认内置主题
const DEFAULT_THEME_LIST = ["dark", "light"];

const themeLinkElements: Element[] = [];

export const hasThemeLink = (themeTag: string) => {
    themeLinkElements.length = 0;

    const lowerThemeTag = themeTag.toLocaleLowerCase();
    const fullThemeSrc = BASE_URL + lowerThemeTag + ASYNC_LOAD_THEME_RULE;

    const isCssLink = (child: Element) => child.localName == "link" && child.getAttribute("rel") == "stylesheet";

    let targetChild: Element | null = null;
    for (const child of document.head.children) {
        if (isCssLink(child)) {
            if (child.getAttribute("href")?.includes(fullThemeSrc)) {
                targetChild = child;
                continue;
            }
            if (child.getAttribute("href")?.includes(ASYNC_LOAD_THEME_RULE)) {
                // 标记已加载的主题文件，用于后续清理防止样式覆盖
                themeLinkElements.push(child);
            }
        }
    }
    return targetChild;
};
/**
 * 添加主题链接
 * @param themeTag 主题标识
 * @returns
 */
export const addThemeLink = (themeTag: string) => {
    const el = hasThemeLink(themeTag);
    if (el) {
        // 如果当前主题文件存在，则直接切换主题
        document.body.setAttribute(THEME_MODE_ATTR, themeTag);
        return;
    }
    // 设置主题资源
    const fullThemeSrc = BASE_URL + themeTag.toLocaleLowerCase() + ASYNC_LOAD_THEME_RULE;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fullThemeSrc;
    document.head.appendChild(link);
    link.onload = function () {
        // 加载完成后删除其余主题文件
        themeLinkElements.forEach((v) => v.remove());
        document.body.setAttribute(THEME_MODE_ATTR, themeTag);
    };
};
/**
 * 切换主题
 * @param themeTag 主题标识
 */
export const changeTheme = (themeTag: string) => {
    const lowerThemeTag = themeTag.toLocaleLowerCase();
    if (DEFAULT_THEME_LIST.includes(lowerThemeTag)) {
        document.body.setAttribute(THEME_MODE_ATTR, lowerThemeTag);
    } else {
        addThemeLink(lowerThemeTag);
    }
};
