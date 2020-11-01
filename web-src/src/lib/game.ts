import { GameBlock } from './game-block'

interface IUser {
    id: number
    name: string
    bg: string
}

interface ILotteryItem {
    award_id: number
    award_name: string
    count: number
}

interface IGameSettings {
    pickCountList: Array<ILotteryItem>
    asserts: Map<string, HTMLImageElement>
}

interface IEndingAnimation {
    columnItemCount: number //每行摆几个用户
    marginX: number //每个用户的x轴间距
    marginY: number // 每个用户的y轴间距
    runTime: number // 结束动画运行几秒钟
    fontStyle: string // 用户名字体style
    usernameHeight: number //展示用户名高度
}
interface IAnimation {
    // 单个元素宽度
    itemWidth: number;
    // 单个元素高度
    itemHeight: number;
    // 单个重力加速度
    G_FORCE(): number;
    countOfItemInRunningAtAnyTime: number // 初始运动的个数
    newItemItervalTime(): number // 每新增1个的间隔时间 毫秒

    endingAnimation: IEndingAnimation //结束动画配置
}

// 结束动画
class EndAnimation {
    private fixedBlockGroup: Array<Array<GameBlock>>
    private canvas: HTMLCanvasElement
    private asserts: Map<string, HTMLImageElement>
    private readonly animation: IEndingAnimation
    constructor(canvas: HTMLCanvasElement, fixedBlockGroup: Array<Array<GameBlock>>, setting: { asserts: Map<string, HTMLImageElement> }, animation: IEndingAnimation) {
        this.asserts = setting.asserts
        this.canvas = canvas
        this.fixedBlockGroup = fixedBlockGroup
        this.animation = animation
        this.calculateFixedBlockRunParms()
        this.run()
    }
    // 计算目标位置，设置目标地址和vx,vy
    private calculateFixedBlockRunParms() {
        // 按50FPS算
        const fps = 50
        // 动画总共运行3秒
        const runTime = this.animation.runTime

        // 每行摆10个
        let columnCount = this.animation.columnItemCount
        // 每个头像间的间隔
        let marginX = this.animation.marginX
        let marginY = this.animation.marginY

        // 奖品展示高度
        let awardHeight = 0

        // Step 1. 计算总共有显示多少行，便于元素定位Y轴起始位置
        let totalRowCount = 0
        let currentRowIndex = 0

        let oneItemHeight = 0
        let oneItemWidth = 0
        for (let i = 0; i < this.fixedBlockGroup.length; i++) {
            if (this.fixedBlockGroup[i].length > 0) {
                oneItemHeight = this.fixedBlockGroup[i][0].targetH
                oneItemWidth = this.fixedBlockGroup[i][0].targetW
                break
            }
        }


        this.fixedBlockGroup.forEach((group) => {
            if (group.length === 0) {
                return
            }
            // 当前奖品数量占用几行
            const useRowCount = (group.length % columnCount === 0) ? (group.length / columnCount) : (Math.floor(group.length / columnCount) + 1)
            totalRowCount = totalRowCount + useRowCount
        })

        // 开始的Y轴 =  (画布高度- （元素高度+间隔+加上用户名的高度）* 总行数 - 抽奖数量*奖品高度)/2
        let startY = (this.canvas.height - (oneItemHeight + marginY + this.animation.usernameHeight) * totalRowCount - this.fixedBlockGroup.length * awardHeight) / 2


        this.fixedBlockGroup.forEach((group, groupIndex) => {
            if (group.length === 0) {
                return
            }
            let startX = (this.canvas.width - (oneItemWidth + marginX) * columnCount) / 2
            // 小于10个，居中显示
            if (group.length <= columnCount) {
                startX = (this.canvas.width - (oneItemWidth + marginX) * group.length) / 2
            }
            group.forEach((gameBlcok, blockIndex) => {
                // 该元素位于第几列
                let columnIndex = Math.floor(blockIndex % columnCount)
                // 该元素位于第几行
                let rowIndex = Math.floor(blockIndex / columnCount) + currentRowIndex
                // 设置元素 的目标位置
                gameBlcok.targetX = startX + columnIndex * (oneItemWidth + marginX)
                gameBlcok.targetY = startY + rowIndex * (oneItemHeight + marginY + this.animation.usernameHeight) + (groupIndex + 1) * awardHeight
                gameBlcok.vx = (gameBlcok.targetX - gameBlcok.x) / (fps * runTime)
                gameBlcok.vy = (gameBlcok.targetY - gameBlcok.y) / (fps * runTime)
                gameBlcok.vBigX = (oneItemWidth - gameBlcok.w) / (fps * runTime)
                gameBlcok.vBigY = (oneItemHeight - gameBlcok.h) / (fps * runTime)

            })

            const useRowCount = (group.length % columnCount === 0) ? (group.length / columnCount) : (Math.floor(group.length / columnCount) + 1)
            currentRowIndex += useRowCount
        })
    }

    private draw() {
        const ctx = this.canvas.getContext("2d")

        this.fixedBlockGroup.forEach((group) => {
            group.forEach((item) => {
                // 元素已到达目标地址
                // 更新位置
                item.big()
                item.move()
                item.rotate()

                // ** img 规定要使用的图像、画布或视频。
                // ** sx 可选。开始剪切的 x 坐标位置。
                // ** sy 可选。开始剪切的 y 坐标位置。
                // ** swidth 可选。被剪切图像的宽度。
                // ** sheight 可选。被剪切图像的高度。
                // ** x 在画布上放置图像的 x 坐标位置。
                // ** y 在画布上放置图像的 y 坐标位置。
                // ** width 可选。要使用的图像的宽度。（伸展或缩小图像）
                // ** height 可选。要使用的图像的高度。（伸展或缩小图像）
                // 画头像
                const avatar = this.asserts.get("user_" + item.id)
                ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height, item.x + item.w / 4, item.y + item.h / 4, item.w / 2, item.h / 2)
                // 写名字
                if (item.isStopped()) {
                    ctx.font = this.animation.fontStyle
                    // 名字是否超长
                    const nameLength = ctx.measureText(item.data.name).width
                    const showAwatartWidth = item.w + this.animation.marginX * 2
                    if (nameLength > showAwatartWidth) {
                        ctx.fillText(item.data.name, item.x, item.y + item.h + this.animation.marginY)
                    } else {
                        ctx.fillText(item.data.name, item.x + (showAwatartWidth - nameLength) / 2, item.y + item.h + this.animation.marginY)
                    }
                }


                ctx.save()
                // 移动原点中心位置
                const center = item.getCurrentPostionCenter()
                ctx.translate(center.x, center.y)
                // 旋转
                ctx.rotate(item.degrees)
                // 画背景
                const itemBg = this.asserts.get("itemBg")
                ctx.drawImage(itemBg, 0, 0, itemBg.width, itemBg.height, -1 * item.w / 2, -1 * item.w / 2, item.w, item.h)
                ctx.restore()

            })
        })
    }
    // 将选择的对象，排列规则
    private run() {
        const ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.draw()
        requestAnimationFrame(() => {
            this.run()
        })
    }
}

export class GameScreen {
    private stopped: boolean = false;
    private countOfItemInRunningAtAnyTime: number // 初始运动的个数
    private canvas: HTMLCanvasElement
    private runningStore: Map<number, GameBlock> = new Map<number, GameBlock>()//  存储当前运动的元素
    private preparePool: Array<GameBlock> = []
    // 抽奖的个数
    private pickCountList: Array<ILotteryItem> = []
    private asserts: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>()
    private readonly animationConfig: IAnimation
    constructor(canvas: HTMLCanvasElement, userList: Array<IUser>, setting: IGameSettings, animation: IAnimation) {
        this.canvas = canvas
        this.pickCountList = setting.pickCountList
        this.asserts = setting.asserts
        this.countOfItemInRunningAtAnyTime = animation.countOfItemInRunningAtAnyTime
        this.animationConfig = animation
        this.initUserPool(userList, animation)
    }
    // 打乱数组 洗牌
    private shuffle(list: Array<any>) {
        var m = list.length
        var t, i: any;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = list[m];
            list[m] = list[i];
            list[i] = t;
        }
        return list;
    }

    private initUserPool(userList: Array<IUser>, animationConfig: IAnimation) {
        // 打乱数组
        userList = this.shuffle(userList)
        // 初速度
        const initVy = Math.floor(Math.random() * 10)
        for (let i = 0; i < userList.length; i++) {
            // 位置随机
            let x = Math.floor((this.canvas.width - animationConfig.itemWidth) * Math.random())
            // x, 0 - this.itemHeight, 0, initVy, this.itemWidth, this.itemHeight, "", userList[i])
            this.preparePool.push(new GameBlock({ x: x, y: 0 - animationConfig.itemHeight, vx: 0, vy: initVy, w: animationConfig.itemWidth, h: animationConfig.itemHeight, data: userList[i], g: animationConfig.G_FORCE() }))
        }
    }
    // 选出初始状态的运动元素
    private pickInitRunItems() {

        // 运动数量小于总数
        if (this.countOfItemInRunningAtAnyTime < this.preparePool.length) {
            let i = 0
            while (i < this.countOfItemInRunningAtAnyTime) {
                if (this.preparePool.length === 0) {
                    break
                }
                let item = this.preparePool.shift()
                if (!item) {
                    continue
                }
                this.runningStore.set(item.id, item)
                i++
            }
        } else {
            // 运动数量小于总数
            this.preparePool.forEach((item) => {
                this.runningStore.set(item.id, item)
            })
            this.preparePool = []
        }
    }
    private addNewItemAtTime: number = 0
    start() {
        this.pickInitRunItems()
        this.addNewItemAtTime = Date.now()
        this.animation(Date.now())
    }
    // 存储排列顺序
    private fixedBlockGroup: Array<Array<GameBlock>> = []
    stop(): Map<string, Array<IUser>> {
        this.stopped = true
        // 当前屏幕上的所有元素
        let listOnScreen: Array<GameBlock> = []
        for (let key of this.runningStore.keys()) {
            let item = this.runningStore.get(key)
            if (!item) {
                continue
            }
            // 在屏幕内的元素
            if (item.x > 0 && item.y > 0 && item.y < this.canvas.height) {
                listOnScreen.push(item)
            }
        }
        // 洗牌
        listOnScreen = this.shuffle(listOnScreen)
        // 按顺序选幸运用户
        const luckyUserList: Map<string, Array<IUser>> = new Map<string, Array<IUser>>()

        let start = 0
        for (let i = 0; i < this.pickCountList.length; i++) {
            let list = listOnScreen.slice(start, start + this.pickCountList[i].count)
            let q: Array<IUser> = []
            let g: Array<GameBlock> = []
            list.forEach((item) => {
                // 从运动中删除固定元素
                this.runningStore.delete(item.id)
                g.push(item)
                q.push(item.data)
            })
            this.fixedBlockGroup.push(g)
            luckyUserList.set(this.pickCountList[i].award_id + "", q)
            start += this.pickCountList[i].count
        }
        return luckyUserList
    }
    // 绘制固定的元素
    private drawFixedItem() {
        const ctx = this.canvas.getContext("2d")
        this.fixedBlockGroup.forEach((group) => {
            group.forEach((item) => {
                item.rotate()
                // 画头像
                const avatar = this.asserts.get("user_" + item.id)
                ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height, item.x + item.w / 4, item.y + item.h / 4, item.w / 2, item.h / 2)

                ctx.save()
                // 移动原点中心位置
                const center = item.getCurrentPostionCenter()
                ctx.translate(center.x, center.y)
                // 旋转
                ctx.rotate(item.degrees)

                const itemBg = this.asserts.get("itemBg")
                ctx.drawImage(itemBg, 0, 0, itemBg.width, itemBg.height, -1 * item.w / 2, -1 * item.h / 2, item.w, item.h)
                ctx.restore()
            })
        })
    }

    // 计算每个元素位置，并将它画出来
    private computeEveryItemPositionAndDrawIt(runTimeInterval: number) {
        // 向下加速度【模拟重力】
        const ctx = this.canvas.getContext("2d")
        const keys = this.runningStore.keys()
        for (let key of keys) {
            let item = this.runningStore.get(key)
            if (!item) {
                continue
            }
            // 挑选超出边界的元素，从用户池删除
            // x 轴超出,  因为不计算反弹，那么y只能朝下方超出边界
            if (item.x > this.canvas.width || item.x < 0 - item.w || item.y > this.canvas.height) {
                this.runningStore.delete(key)
                // 重置x, y位置, vy速度
                item.x = Math.floor((this.canvas.width - item.w) * Math.random())
                item.y = 0 - item.h
                item.vy = Math.floor(Math.random() * 3)
                item.degrees = 0
                // 移除去等元素重新加入待选取池
                this.preparePool.push(item)

                continue
            }
            // 画头像
            const avatar = this.asserts.get("user_" + item.id)
            ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height, item.x + item.w / 4, item.y + item.h / 4, item.w / 2, item.h / 2)

            ctx.save()
            // 移动原点中心位置
            const center = item.getCurrentPostionCenter()
            ctx.translate(center.x, center.y)
            // 旋转
            ctx.rotate(item.degrees)

            const itemBg = this.asserts.get("itemBg")
            ctx.drawImage(itemBg, 0, 0, itemBg.width, itemBg.height, -1 * item.w / 2, -1 * item.h / 2, item.w, item.h)
            ctx.restore()

            // 更新位置
            item.move()
            item.rotate()
            if (this.stopped) {
                item.vy += item.g * runTimeInterval * 2;
            } else {
                item.vy += item.g * runTimeInterval;
            }
        }

        // 如果动画已经停止了，那么不再补充新元素
        if (this.stopped) {
            this.drawFixedItem()
            return
        }

        // 那么补充新元素
        if (Date.now() - this.addNewItemAtTime < this.animationConfig.newItemItervalTime()) { // 200 + Math.random() * 500
            return
        }

        // TODO 根据流畅度 考虑剩下等元素是否要重新洗牌，或者某个概率下进行洗牌
        this.preparePool = this.shuffle(this.preparePool)

        this.addNewItemAtTime = Date.now()
        if (this.preparePool.length !== 0) {
            let item = this.preparePool.shift()
            this.runningStore.set(item.id, item)
        }
    }
    // 运动中
    private animation(lastTime: number) {
        //  this.removeOutScreenAndFillFullUserPool(runningStore)
        const ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // 运动时长
        const now = Date.now()
        const runTimeInterval = now - lastTime

        this.computeEveryItemPositionAndDrawIt(runTimeInterval)
        requestAnimationFrame(() => {
            if (this.runningStore.size === 0) {
                new EndAnimation(this.canvas, this.fixedBlockGroup, { asserts: this.asserts }, this.animationConfig.endingAnimation)
                return
            }
            this.animation(now)
        })
    }
}