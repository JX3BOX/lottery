import React from 'react';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Modal, Progress } from "antd"
import { GameScreen } from "../lib/game"
import "./lottery/index.scss"
import { loadAsserts } from "../lib/utils"
import * as neffos from "neffos.js"
interface RouterProps { }

interface IState {
    visible: boolean
    percent: number
    size: number
}
class Page extends React.Component<RouteComponentProps<RouterProps>, IState> {
    private myRef: React.RefObject<any>
    private game: GameScreen = null
    private nsConn: neffos.NSConn = null
    private settingId: string = null
    constructor(props: RouteComponentProps<RouterProps>) {
        super(props)
        this.myRef = React.createRef();
        this.state = {
            visible: true,
            percent: 0,
            size: 0
        }

    }
    // Setup 1 获取抽奖配置和用户信息
    async prepareSetting(id: string) {
        return fetch("/api/setting/prepare/" + id).then((response) => {
            if (response.status === 200) {
                return response.json()
            }
            throw new Error(response.statusText)
        }).then((data) => {
            if (data.code === 0) {
                return data.data
            }
            throw new Error(`code:${data.code}, msg:${data.msg}`)
        }).catch((e: Error) => {
            alert("获取抽奖规则错误:" + e.message)
        })
    }
    // async componentDidUpdate(prevProps, prevState:IState) {
    //     if(prevState.visible === false &&　this.state.visible){

    //     }
    // }
    async componentDidMount() {

        this.listenUserAction()
        // const id = this.props.match.params.settingId
        // this.start(id)
        const screenDom = this.myRef.current as HTMLCanvasElement
        this.game = new GameScreen(screenDom)
        const conn = await neffos.dial(`ws://localhost:14422/sync-action`, {
            default: { // "default" namespace.
                next: (nsConn, msg) => { // "chat" event.
                    this.settingId = msg.Body
                    if (!this.animationHasStart) {
                        this.start(msg.Body)
                    } else {
                        console.log("当初抽奖未完成，无法开启新一轮抽奖")
                    }
                }
            }
        });
        // You can either wait to conenct or just conn.connect("connect")
        // and put the `handleNamespaceConnectedConn` inside `_OnNamespaceConnected` callback instead.
        // const nsConn = await conn.connect("default");
        // nsConn.emit(...); handleNamespaceConnectedConn(nsConn);
        this.nsConn = await conn.connect("default");

    }
    private animationHasStart = false
    async start(id: string) {
        if (this.game) {
            this.game.end()
        }
        this.setState({ visible: true })
        this.animationHasStart = true
        var data: any = {}
        try {
            data = await this.prepareSetting(id)
        } catch (e) {
            console.log(e)
            return
        }
        if (!data || !data.userList) {
            console.log(data)
            return
        }
        // const poolName = data.setting.pool
        const preloadAssets = [{
            name: "itemBg", source: "/item-bg.png"
        }, { name: "default_avatar", source: "/team_avatar.png" }]

        data.userList.forEach((user) => {
            preloadAssets.push({
                name: "user_" + user.id,
                source: user.avatar
            })
        })
        const totalSize = preloadAssets.length
        let loadedSize = 0
        const asserts = await loadAsserts(preloadAssets, () => {
            loadedSize++
            let precent = Math.floor((loadedSize / totalSize) * 100)
            this.setState({ percent: precent })
        })


        this.setState({ visible: false, percent: 0 })
        this.game.start(data.userList, {
            pickCountList: data.setting.rule,
            asserts: asserts
        }, {
            itemWidth: 160,
            itemHeight: 160,
            G_FORCE: (): number => {
                return 0.001 //如果要下降速度不一样可以改成随机数
            },
            countOfItemInRunningAtAnyTime: 20,  //初始运动的个数
            newItemItervalTime: () => { return 60 + Math.random() * 200 },  // 调整速度
            endingAnimation: {
                columnItemCount: 5,
                marginX: 10,
                marginY: 10,
                runTime: 3,
                fontStyle: `20px Arial`,
                usernameHeight: 20
            }
        })
    }
    doLottery() {
        if (!this.game) {
            return
        }
        const store = this.game.stop()
        const id = this.settingId
        const luckyList = []
        const keys = store.keys()
        for (let key of keys) {
            const userList = store.get(key).map((user) => { return user.id })
            luckyList.push({
                award_id: ~~key,
                user_id_list: userList
            })
        }
        fetch("/api/setting/lucky-people/" + id, {
            method: "POST",
            body: JSON.stringify(luckyList),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((resp) => { return resp.json() }).then((d) => {
            console.log(d)
            this.nsConn.emit('finish', this.settingId)
        }).catch((e) => {
            console.log(e)
            this.nsConn.emit('finish', this.settingId)
            alert("抽奖失败！")
        })
    }
    // 监听键盘事件
    listenUserAction() {
        var action = (even: KeyboardEvent) => {
            const keyName = even.key
            if (!this.animationHasStart) {
                console.log("抽奖还没开始，不能操作")
                return
            }
            switch (keyName) {
                // 空格键抽奖
                case " ":
                    this.animationHasStart = false
                    this.doLottery()
                    break
            }
        }
        document.addEventListener("keyup", action)

    }

    render() {
        const title = this.state.percent === 0 ? "抽奖" : "正在加载图片资源"
        return (
            <div className="screen">
                <div className="stage">
                    <canvas width='1664' height='874' ref={this.myRef}></canvas>
                </div>
                <div className="screen-cover">
                    <div className="screen-title"></div>
                </div>
                <Modal
                    title={title}
                    visible={this.state.visible}
                    centered={true}
                    closable={false}
                    footer={null}
                    keyboard={false}
                    maskClosable={false}
                >
                    {this.state.percent === 0 ? <h2>抽奖准备中...</h2> : <Progress percent={this.state.percent} />}
                </Modal>
            </div >
        )
    }
}
export default withRouter(Page)