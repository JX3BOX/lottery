import React from 'react';
import { RouteComponentProps, withRouter } from "react-router-dom";
import { GameScreen } from "../lib/game"
import "./lottery/index.scss"
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

        this.game = new GameScreen(screenDom, setting.userList, {
            countOfItemInRunningAtAnyTime: 30,
            newCountPeerSecond: 15,
            pickCountList: [10]
        })
    }
    // 监听键盘事件
    listenUserAction() {
        var hasStop = false
        var hasStart = false
        var action = (even: KeyboardEvent) => {
            const keyName = even.key
            switch (keyName) {
                // 空格键暂停抽奖
                case " ":
                    if (this.game) {
                        hasStop = true
                        this.game.stop()
                    }
                    break
                // 回车键滚动屏幕
                case "Enter":
                    if (!hasStop && this.game && !hasStart) {
                        hasStart = true
                        this.game.start()
                    }
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