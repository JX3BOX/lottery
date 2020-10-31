
interface IAssert {
    name: string
    source: string
}

async function loadImage(url: string): Promise<HTMLImageElement> {
    console.log("正在加载图片资源:" + url)
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = function () {
            return resolve(img)
        };
        img.onerror = () => reject(new Error(`load ${url} fail`));
    })
}

// 资源加载器
export async function loadAsserts(list: Array<IAssert>): Promise<Map<string, HTMLImageElement>> {
    const asserts = new Map<string, HTMLImageElement>()
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const itemBg: HTMLImageElement = await loadImage(item.source)
        asserts.set(item.name, itemBg)
    }
    console.log("资源加载完成！")
    return asserts
}
