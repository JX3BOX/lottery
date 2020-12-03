import React from 'react';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Modal, Progress } from "antd"
import { GameScreen } from "../lib/game"
import "./lottery/index.scss"
import { loadAsserts } from "../lib/utils"
import * as neffos from "neffos.js"
interface RouterProps {
    settingId: string;   // This one is coming from the router
}

interface IState {
    visible: boolean
    percent: number
    size: number
}
class Page extends React.Component<RouteComponentProps<RouterProps>, IState> {
    private myRef: React.RefObject<any>
    private game: GameScreen = null
    private nsConn: neffos.NSConn = null
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

    async componentDidMount() {
        // const id = this.props.match.params.settingId
        // this.start(id)

        const conn = await neffos.dial(`ws://localhost:14422/sync-action`, {
            default: { // "default" namespace.
                next: (nsConn, msg) => { // "chat" event.
                    console.log(msg.Body);
                    this.start(msg.Body)
                }
            }
        });
        // You can either wait to conenct or just conn.connect("connect")
        // and put the `handleNamespaceConnectedConn` inside `_OnNamespaceConnected` callback instead.
        // const nsConn = await conn.connect("default");
        // nsConn.emit(...); handleNamespaceConnectedConn(nsConn);
        this.nsConn = await conn.connect("default");

    }
    private assertsPool: { [key: string]: Map<string, HTMLImageElement> } = {}
    async start(id: string) {

        this.listenUserAction()
        const screenDom = this.myRef.current as HTMLCanvasElement
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
        const poolName = data.setting.pool

        var asserts = this.assertsPool[poolName]
        if (!asserts) {
            const preloadAssets = [{
                name: "itemBg", source: "/item-bg.png"
            }]

            data.userList.forEach((user) => {
                preloadAssets.push({
                    name: "user_" + user.id,
                    source: user.avatar
                })
            })
            const totalSize = preloadAssets.length
            let loadedSize = 0
            // this.setState({ size: totalSize })
            asserts = await loadAsserts(preloadAssets, () => {
                loadedSize++
                let precent = Math.floor((loadedSize / totalSize) * 100)
                this.setState({ percent: precent })
            })
            this.assertsPool[poolName] = asserts
        } else {
            this.setState({ percent: 100 })
        }


        this.setState({ visible: false })
        this.game = new GameScreen(screenDom, data.userList, {
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
        this.game.start()
    }
    doLottery() {
        if (!this.game) {
            return
        }
        const store = this.game.stop()
        const id = this.props.match.params.settingId
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
        }).then((resp) => { return resp.json() }).then((d) => { console.log(d) }).catch((e) => {
            console.log(e)
            alert("抽奖失败！")
        })
    }
    // 监听键盘事件
    listenUserAction() {
        var action = (even: KeyboardEvent) => {
            const keyName = even.key
            switch (keyName) {
                // 空格键抽奖
                case " ":
                    this.doLottery()
                    document.body.removeEventListener("keyup", action)
                    break
                // Esc键回到首页
                case "Escape":
                    document.body.removeEventListener("keyup", action)
                    this.props.history.goBack()
                    break
            }
        }
        document.body.addEventListener("keyup", action)

    }
    render() {
        return (
            <div className="screen">
                <div className="stage">
                    <canvas width='1664' height='874' ref={this.myRef}></canvas>
                </div>
                <div className="screen-cover">
                    <div className="screen-title"></div>
                </div>
                <Modal
                    title={`正在加载图片资源`}
                    visible={this.state.visible}
                    centered={true}
                    closable={false}
                    footer={null}
                    keyboard={false}
                    maskClosable={false}
                >
                    <Progress percent={this.state.percent} />
                </Modal>
            </div >
        )
    }
}
export default withRouter(Page)