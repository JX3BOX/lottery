// 单个用户数据体
class UserBlock {
    constructor(x, y, vx, vy, bg, data) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.bg = bg;
        this.__data = data;
    }
}

class Screen {
    constructor(canvas, userList){
        this.screenWidth = 1920
        this.screenHeight = 1080
        this.itemWidth = 40 // 每个元素宽度
        this.itemHeight = 40 // 每个元素高度
        this.countOfItemInRunningAtAnyTime = 10
        this.canvas = canvas;
        // 字典化,用于统计已经出现的用户信息
        this.userMap = {}
        this.userPool = []
        this.initUserPool(userList)
    }

    initUserPool(userList){
        // 初速度
        const initVy = -20
        for (let i = 0; i < userList.length; i++) {
            // 位置随机
            let x = Math.floor((this.screenWidth - this.itemWidth)*Math.random())
            this.userPool.push(new UserBlock(x, this.screenHeight - this.itemHeight), 0, initVy, "", userList[i])
        }
    }
    start(){
        let currentRunPool = []
        // 运动数量小于总数
        if(this.countOfItemInRunningAtAnyTime < this.userPool.length){
            let i = 0
            while (i < this.countOfItemInRunningAtAnyTime) {
                const idx = Math.floor(this.userPool.length*Math.random())
                // 防止重复
                if(this.userMap[idx]){
                    continue
                }
                currentRunPool.push(this.userPool[idx])
                this.userMap[idx] = true
                i++
            }
        }else{
            // 运动数量小于总数
            this.userPool.forEach((item)=>{
                currentRunPool.push(item)
            })
        }

        this.animal(currentRunPool)

     //   requestAnimationFrame()
    }
    computeEveryItemPosition() {

    }
    //
    animal(itemList){
        const ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.screenWidth, this.screenHeight)

        this.computeEveryItemPosition()
        requestAnimationFrame(()=>{
            this.animal(itemList)
        })
    }
}



// Setup 1 获取用户
async function prepareSetting(id) {
    return fetch("/api/prepare/setting/" + id).then((response) => {
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

async function main() {

    const urlParams = new URLSearchParams(location.search.substring(1));
    const params = Object.fromEntries(urlParams);

    const id = params.id
    if (id == "") {
        alert("没有该抽奖规则!!")
        return
    }

    const screenDom = document.getElementById('screen');
    const screen = new Screen(screenDom, [1,2,3,4,5,7,8,9])
    // Setup 1 获取用户 和抽奖 配置
   // let setting = await prepareSetting(id)
    // 生成动画item池
    //generateUserBlockPool(screen, [1,2,3,4,5,7,8,9])
}