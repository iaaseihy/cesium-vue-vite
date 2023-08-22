/**
 * 设置CSS。
 *
 * @author Helsing
 * @date 2019/11/12
 * @param {Element|HTMLElement|String} srcNodeRef 元素ID、元素或数组。
 * @param {String} property 属性。
 * @param {String} value 值。
 */
 export function setCss(srcNodeRef, property, value) {
    if (srcNodeRef) {
        if (srcNodeRef instanceof Array && srcNodeRef.length > 0) {
            for (let i = 0; i < srcNodeRef.length; i++) {
                srcNodeRef[i].style.setProperty(property, value);
            }
        } else if (typeof (srcNodeRef) === "string") {
            if (srcNodeRef.indexOf("#") < 0 && srcNodeRef.indexOf(".") < 0 && srcNodeRef.indexOf(" ") < 0) {
                const element = document.getElementById(srcNodeRef);
                element && (element.style.setProperty(property, value));
            } else {
                const elements = document.querySelectorAll(srcNodeRef);
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.setProperty(property, value);
                }
            }
        } else if (srcNodeRef instanceof HTMLElement) {
            srcNodeRef.style.setProperty(property, value);
        }
    }
};

/**
 * 设置元素的值。
 *
 * @author Helsing
 * @date 2019/11/12
 * @param {String|HTMLElement|Array} srcNodeRef 元素ID、元素或数组。
 * @param {String} value 值。
 */
 export function setInnerText (srcNodeRef, value) {
    if (srcNodeRef) {
        if (srcNodeRef instanceof Array && srcNodeRef.length > 0) {
            const that = this;
            for (let i = 0; i < srcNodeRef.length; i++) {
                let element = srcNodeRef[i];
                if (that.isElement(element)) {
                    element.innerText = value;
                }
            }
        } else if (typeof (srcNodeRef) === "string") {
            if (srcNodeRef.indexOf("#") < 0 && srcNodeRef.indexOf(".") < 0 && srcNodeRef.indexOf(" ") < 0) {
                let element = document.getElementById(srcNodeRef);
                element && (element.innerText = value);
            } else {
                const elements = document.querySelectorAll(srcNodeRef);
                for (let i = 0; i < elements.length; i++) {
                    elements[i].innerText = value;
                }
            }
        } else {
            if (this.isElement(srcNodeRef)) {
                srcNodeRef.innerText = value;
            }
        }
    }
};

/**
 * 判断对象是否为元素。
 *
 * @author Helsing
 * @date 2019/12/24
 * @param {Object} obj 对象。
 * @returns {Boolean} 是或否。
 */
 export function isElement (obj) {
    return (typeof HTMLElement === 'object')
        ? (obj instanceof HTMLElement)
        : !!(obj && typeof obj === 'object' && (obj.nodeType === 1 || obj.nodeType === 9) && typeof obj.nodeName === 'string');
};

/**
 * 获取全球唯一ID。
 *
 * @author Helsing
 * @date 2019/11/21
 * @param {Boolean} removeMinus 是否去除“-”号。
 * @returns {String} GUID。
 */
 export function getGuid (removeMinus) {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    if (removeMinus) {
        uuid = uuid.replace(/-/g, "");
    }
    return uuid;
}

// export default {setCss, setInnerText, isElement, getGuid};