import React from 'react';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { GameScreen } from "../lib/game"
import "./lottery/index.scss"
import { loadAsserts } from "../lib/utils"
interface RouterProps {
    settingId: string;   // This one is coming from the router
}

class Page extends React.Component<RouteComponentProps<RouterProps>> {
    private myRef: React.RefObject<any>
    private game: GameScreen = null
    constructor(props: RouteComponentProps<RouterProps>) {
        super(props)
        this.myRef = React.createRef();
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
        const asserts = await loadAsserts([{
            name: "itemBg", source: "/item-bg.png"
        }, {
            name: "demo", source: "/demo.png"
        }])

        this.game = new GameScreen(screenDom, setting.userList, {
            countOfItemInRunningAtAnyTime: 20,
            newCountPeerSecond: 10,
            pickCountList: setting.setting.rule,
            asserts: asserts
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
                    break
                // Esc键回到首页
                case "Escape":
                    document.body.removeEventListener("keyup", action)
                    this.props.history.push("/home")
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
            </div>
        )
    }
}
export default withRouter(Page)