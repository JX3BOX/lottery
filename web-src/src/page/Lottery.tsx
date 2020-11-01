import React from 'react';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Modal, Progress } from "antd"
import { GameScreen } from "../lib/game"
import "./lottery/index.scss"
import { loadAsserts } from "../lib/utils"
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
    async prepareSetting() {
        const id = this.props.match.params.settingId
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
        this.listenUserAction()
        const screenDom = this.myRef.current as HTMLCanvasElement
        var setting: any = {}
        try {
            setting = await this.prepareSetting()
        } catch (e) {
            return
        }
        if (!setting) {
            return
        }


        const preloadAssets = [{
            name: "itemBg", source: "/item-bg.png"
        }]

        setting.userList.forEach((user) => {
            preloadAssets.push({
                name: "user_" + user.id,
                source: user.avatar
            })
        })
        const totalSize = preloadAssets.length
        let loadedSize = 0
        this.setState({ size: totalSize })
        const asserts = await loadAsserts(preloadAssets, () => {
            loadedSize++
            let precent = Math.floor((loadedSize / totalSize) * 100)
            this.setState({ percent: precent })
        })
        this.setState({ visible: false })
        this.game = new GameScreen(screenDom, setting.userList, {
            pickCountList: setting.setting.rule,
            asserts: asserts
        }, {
            itemWidth: 160,
            itemHeight: 160,
            G_FORCE: (): number => {
                return 0.001
            },
            countOfItemInRunningAtAnyTime: 5,
            newItemItervalTime: () => { return 100 + Math.random() * 200 },
            endingAnimation: {
                columnItemCount: 5,
                marginX: 10,
                marginY: 10,
                runTime: 3,
                fontSize: 20,
                usernameHeight: 0
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
        // fetch("/api/setting/lucky-people/" + id, {
        //     method: "POST",
        //     body: JSON.stringify(luckyList),
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     }
        // }).then((resp) => { return resp.json() }).then((d) => { console.log(d) }).catch((e) => {
        //     console.log(e)
        //     alert("抽奖失败！")
        // })
    }
    // 监听键盘事件
    listenUserAction() {
        var action = (even: KeyboardEvent) => {
            const keyName = even.key
            switch (keyName) {
                // 空格键抽奖
                case " ":
                    this.doLottery()
                    break
                // Esc键回到首页
                case "Escape":
                    document.body.removeEventListener("keyup", action)
                    this.props.history.push("/")
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
                    title={`正在加载${this.state.size}个图片资源`}
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