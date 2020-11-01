
interface IData {
    id: number
    bg: string
}
interface IConfig {
    w: number
    h: number
    x: number
    y: number
    vx: number
    vy: number
    g: number
    vBigX?: number
    vBigY?: number
    targetW?: number
    targetH?: number
    data: IData
}

// 单个运动体
export class GameBlock {
    public w: number
    public h: number
    public x: number
    public y: number
    public vx: number
    public vy: number
    public vBigX: number
    public vBigY: number
    public targetW: number
    public targetH: number
    public data: any
    public id: number
    public g: number

    // 终点位置
    public targetX: number = 0
    public targetY: number = 0

    public degrees: number
    // 遮罩旋转速度
    private rotateSpeed: number = Math.PI * 2 / 120

    constructor(config: IConfig) {
        Object.keys(config).forEach((key) => {
            this[key] = config[key]
        })
        this.degrees = 0
        this.id = this.data.id
        // 变大的最后宽和高
        if (!this.targetW) {
            this.targetW = this.w * 1.5
        }
        if (!this.targetH) {
            this.targetH = this.h * 1.5
        }
        console.log(this.x, this.y, this.vx, this.vy, this.g)
    }
    // 旋转
    public rotate() {
        this.degrees = this.degrees + this.rotateSpeed
        if (this.degrees > Math.PI * 2) {
            this.degrees = this.degrees - Math.PI * 2
        }
    }
    // 移动未知
    public move() {
        this.x = this.x + this.vx
        this.y = this.y + this.vy


        // 根据开始和结速位置 来判断 运动方向，根据运动方向来判断是否 已经达到目标位置
        if (this.targetX !== 0) {
            if (this.vx > 0) {
                if (this.x >= this.targetX) {
                    this.x = this.targetX
                    this.vx = 0
                }
            } else if (this.vx < 0) {
                if (this.x <= this.targetX) {
                    this.x = this.targetX
                    this.vx = 0
                }
            }
        }
        if (this.targetY !== 0) {
            if (this.vy > 0) {
                if (this.y >= this.targetY) {
                    this.y = this.targetY
                    this.vy = 0
                }
            } else if (this.vy < 0) {
                if (this.y <= this.targetY) {
                    this.y = this.targetY
                    this.vy = 0
                }
            }
        }

    }
    public isStopped(): boolean {
        return this.vx === 0 && this.vy === 0
    }
    // 变大
    public big() {
        this.w = this.w + this.vBigX
        this.h = this.h + this.vBigY
        if (this.w >= this.targetW) {
            this.w = this.targetW
            this.vBigX = 0
        }
        if (this.h >= this.targetH) {
            this.h = this.targetH
            this.vBigY = 0
        }
    }
    // 是否已经最大
    public isBiggest(): boolean {
        return this.vBigX === 0 && this.vBigY === 0
    }

    // 获取当前元素的中心
    public getCurrentPostionCenter() {
        return { x: this.x + this.w / 2, y: this.y + this.h / 2 }
    }
}
