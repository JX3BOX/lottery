
interface IUser {
    id: number
}

// 单个用户数据体
class GameBlock {
    public x: number
    public y: number
    public vx: number
    public vy: number
    public bg: string
    public data: IUser
    public id: number
    public g: number
    constructor(x: number, y: number, vx: number, vy: number, bg: string, data: IUser) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.bg = this.getRandomColor();
        this.data = data;
        this.id = data.id;
        this.g = (Math.random() * 5 + 0.1) / 100
    }
    // 测试使用
    private color = ["#0052cc", "#cb22e5", "#8ee524", "#7de89d", "#fcd58d", "#db85d5", "#e2a878", "#239bba", "#e542f7"]
    private getRandomColor(): string {
        return this.color[Math.floor(Math.random() * this.color.length)]
    }
}

interface IGameSettings {
    countOfItemInRunningAtAnyTime: number // 初始运动的个数
    newCountPeerSecond: number // 每秒新增的元素个数
}

class GameScreen {
    private stopped: boolean = false;
    private itemWidth: number = 40 // 每个元素宽度
    private itemHeight: number = 40 // 每个元素高度
    private countOfItemInRunningAtAnyTime: number = 30 // 初始运动的个数
    private newCountPeerSecond = 15 // 每秒新增的元素个数
    private canvas: HTMLCanvasElement
    private runningStore: Map<number, GameBlock> = new Map<number, GameBlock>()//  存储当前运动的元素
    private preparePool: Array<GameBlock> = []
    constructor(canvas: HTMLCanvasElement, userList: Array<IUser>, setting: IGameSettings) {
        this.canvas = canvas

        this.countOfItemInRunningAtAnyTime = setting.countOfItemInRunningAtAnyTime
        this.newCountPeerSecond = setting.newCountPeerSecond

        this.initUserPool(userList)
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

    private initUserPool(userList: Array<IUser>) {
        // 打乱数组
        userList = this.shuffle(userList)
        // 初速度
        const initVy = Math.floor(Math.random() * 10)
        for (let i = 0; i < userList.length; i++) {
            // 位置随机
            let x = Math.floor((this.canvas.width - this.itemWidth) * Math.random())
            this.preparePool.push(new GameBlock(x, 0 - this.itemHeight, 0, initVy, "", userList[i]))
        }
    }
    // 选出初始状态的运动元素
    private pickInitRunItems() {

        // 运动数量小于总数
        if (this.countOfItemInRunningAtAnyTime < this.preparePool.length) {
            let i = 0
            while (i < this.countOfItemInRunningAtAnyTime) {
                let item = this.preparePool.shift()
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
    private addNewItemAtTime: number
    start() {
        this.pickInitRunItems()
        this.addNewItemAtTime = Date.now()
        this.animal(Date.now())
    }
    // 需要固定的元素
    private fixedBlock: Map<number, GameBlock> = new Map<number, GameBlock>()
    stop(pickCountList: Array<number>): Array<Array<IUser>> {
        this.stopped = true
        // 当前屏幕上的所有元素
        let listOnScreen: Array<GameBlock> = []
        for (let key of this.runningStore.keys()) {
            let item = this.runningStore.get(key)
            // 在屏幕内的元素
            if (item.x > 0 && item.y > 0 && item.y < this.canvas.height) {
                listOnScreen.push(item)
            }
        }
        // 洗牌
        listOnScreen = this.shuffle(listOnScreen)
        // 按顺序选幸运用户
        const luckyUserList: Array<Array<IUser>> = []

        let start = 0
        for (let i = 0; i < pickCountList.length; i++) {
            let list = listOnScreen.slice(start, start + pickCountList[i])
            let q: Array<IUser> = []
            list.forEach((item) => {
                q.push(item.data)
            })
            luckyUserList.push(q)
            start = pickCountList[i]
        }
        return luckyUserList
    }

    // 计算每个元素位置，并将它画出来
    private computeEveryItemPositionAndDrawIt(runTimeInterval: number) {
        // 向下加速度【模拟重力】
        const ctx = this.canvas.getContext("2d")
        const keys = this.runningStore.keys()
        for (let key of keys) {
            let item = this.runningStore.get(key)
            // 挑选超出边界的元素，从用户池删除
            // x 轴超出,  因为不计算反弹，那么y只能朝下方超出边界
            if (item.x > this.canvas.width || item.x < 0 - this.itemWidth || item.y > this.canvas.height) {
                this.runningStore.delete(key)
                // 重置x, y位置,vy速度
                item.x = Math.floor((this.canvas.width - this.itemWidth) * Math.random())
                item.y = 0 - this.itemHeight
                item.vy = Math.floor(Math.random() * 3)
                // 移除去等元素重新加入待选取池
                this.preparePool.push(item)

                continue
            }
            // drawItem
            ctx.fillStyle = item.bg
            ctx.beginPath();
            ctx.arc(item.x + this.itemWidth / 2, item.y + this.itemHeight / 2, this.itemWidth / 2, 0, 2 * Math.PI)
            ctx.closePath();
            ctx.fill();

            // 更新位置
            item.y += item.vy
            item.x += item.vx
            item.vy += item.g * runTimeInterval;
            this.runningStore.set(item.id, item)
        }


        // 那么补充新元素
        if (Date.now() - this.addNewItemAtTime < 200 + Math.random() * 800) {
            return
        }

        // TODO 根据流畅度 考虑剩下等元素是否要重新洗牌，或者某个概率下进行洗牌
        this.preparePool = this.shuffle(this.preparePool)

        this.addNewItemAtTime = Date.now()

        let needAddNewItem = this.newCountPeerSecond
        if (needAddNewItem >= this.preparePool.length) {
            // 剩余小于应新加新元素个数
            this.preparePool.forEach((item) => {
                this.runningStore.set(item.id, item)
            })
            this.preparePool = []
            return
        }
        while (needAddNewItem > 0) {
            let item = this.preparePool.shift()
            this.runningStore.set(item.id, item)
            needAddNewItem--
        }
    }
    private animal(lastTime: number) {
        //  this.removeOutScreenAndFillFullUserPool(runningStore)
        const ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // 运动时长
        const now = Date.now()
        const runTimeInterval = now - lastTime

        this.computeEveryItemPositionAndDrawIt(runTimeInterval)
        requestAnimationFrame(() => {
            if (this.stopped) {
                return
            }
            this.animal(now)
        })
    }
}



// Setup 1 获取用户
async function prepareSetting(id: string) {
    return fetch("/api/setting/prepare/" + id).then((response) => {
        if (response.status == 200) {
            return response.json()
        }
        throw new Error(response.statusText)
    }).then((data) => {
        if (data.code == 0) {
            return data.data
        }
        throw new Error(`code:${data.code}, msg:${data.msg}`)
    })
}
var game: GameScreen
async function main() {
    const urlParams = new URLSearchParams(location.search.substring(1));
    const id = urlParams.get("id");
    if (!id) {
        alert("没有该抽奖规则!!")
        return
    }
    // Setup 1 获取用户 和抽奖 配置
    let setting = await prepareSetting(id)
    console.log(setting)
    const screenDom = <HTMLCanvasElement>document.getElementById('screen');
    game = new GameScreen(screenDom, setting.userList, {
        countOfItemInRunningAtAnyTime: 30,
        newCountPeerSecond: 15
    })
    game.start()
    // Setup 1 获取用户 和抽奖 配置
    // let setting = await prepareSetting(id)
    // 生成动画item池
    //generateUserBlockPool(screen, [1,2,3,4,5,7,8,9])
}
function stopGame() {
    if (game) {
        let list = game.stop([10])
        console.log(list)
    }
}
main()