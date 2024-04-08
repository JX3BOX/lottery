import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Modal, Progress } from "antd";
import { GameScreen } from "../lib/game";
import "./lottery/index.scss";
import { loadAsserts } from "../lib/utils";
import * as neffos from "neffos.js";
interface RouterProps {}

interface IState {
  visible: boolean;
  percent: number;
  size: number;
  isLotteryActive: boolean;
  speed: number;
}
class Page extends React.Component<RouteComponentProps<RouterProps>, IState> {
  private myRef: React.RefObject<any>;
  private game: GameScreen = null;
  private nsConn: neffos.NSConn = null;
  private settingId: string = null;
  private resourceUrl: string = "https://img.jx3box.com/topic/lottery";
  constructor(props: RouteComponentProps<RouterProps>) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      visible: false,
      percent: 0,
      size: 0,
      isLotteryActive: true,
      speed: 15,
    };
  }
  // Setup 1 获取抽奖配置和用户信息
  async prepareSetting(id: string) {
    return fetch("/api/setting/prepare/" + id)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then((data) => {
        if (data.code === 0) {
          return data.data;
        }
        throw new Error(`code:${data.code}, msg:${data.msg}`);
      })
      .catch((e: Error) => {
        alert("获取抽奖规则错误:" + e.message);
      });
  }
  // async componentDidUpdate(prevProps, prevState:IState) {
  //     if(prevState.visible === false &&　this.state.visible){

  //     }
  // }
  async componentDidMount() {
    this.listenUserAction();
    // const id = this.props.match.params.settingId
    // this.start(id)
    const screenDom = this.myRef.current as HTMLCanvasElement;
    this.game = new GameScreen(screenDom);
    const conn = await neffos.dial(`ws://localhost:14422/sync-action`, {
      default: {
        // "default" namespace.
        next: (nsConn, msg) => {
          // "chat" event.
          this.settingId = msg.Body;
          if (!this.animationHasStart) {
            this.start(msg.Body);
          } else {
            console.log("当初抽奖未完成，无法开启新一轮抽奖");
          }
        },
      },
    });
    // You can either wait to conenct or just conn.connect("connect")
    // and put the `handleNamespaceConnectedConn` inside `_OnNamespaceConnected` callback instead.
    // const nsConn = await conn.connect("default");
    // nsConn.emit(...); handleNamespaceConnectedConn(nsConn);

    this.nsConn = await conn.connect("default");
  }
  private animationHasStart = false;
  async start(id: string) {
    if (this.game) {
      this.game.end();
    }
    this.setState({ visible: true });
    this.animationHasStart = true;
    var data: any = {};
    try {
      data = await this.prepareSetting(id);
    } catch (e) {
      console.log(e);
      return;
    }
    if (!data || !data.userList) {
      console.log(data);
      return;
    }
    // const poolName = data.setting.pool
    const preloadAssets = [
      {
        name: "itemBg",
        source: `${this.resourceUrl}/item-bg.png`,
      },
      { name: "default_avatar", source: "/team_avatar.png" },
    ];

    data.userList.forEach((user) => {
      preloadAssets.push({
        name: "user_" + user.id,
        source: user.avatar,
      });
    });
    const totalSize = preloadAssets.length;
    let loadedSize = 0;
    const asserts = await loadAsserts(preloadAssets, () => {
      loadedSize++;
      let precent = Math.floor((loadedSize / totalSize) * 100);
      this.setState({ percent: precent });
    });

    this.setState({ visible: false, percent: 0 });
    this.game.start(
      data.userList,
      {
        pickCountList: data.setting.rule,
        asserts: asserts,
      },
      {
        itemWidth: 160,
        itemHeight: 160,
        G_FORCE: (): number => {
          return 0.001; //如果要下降速度不一样可以改成随机数
        },
        countOfItemInRunningAtAnyTime: 20, //初始运动的个数
        newItemItervalTime: () => {
          return 60 + Math.random() * 200;
        }, // 调整速度
        endingAnimation: {
          columnItemCount: 5,
          marginX: 10,
          marginY: 10,
          runTime: 1.5,
          fontStyle: `20px Arial`,
          usernameHeight: 20,
        },
      }
    );
  }
  doLottery() {
    if (!this.game) {
      return;
    }
    const store = this.game.stop();
    const id = this.settingId;
    const luckyList = [];
    const keys = store.keys();
    for (let key of keys) {
      const userList = store.get(key).map((user) => {
        return user.id;
      });
      luckyList.push({
        award_id: ~~key,
        user_id_list: userList,
      });
    }
    fetch("/api/setting/lucky-people/" + id, {
      method: "POST",
      body: JSON.stringify(luckyList),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((resp) => {
        return resp.json();
      })
      .then((d) => {
        console.log(d);
        this.nsConn.emit("finish", this.settingId);
      })
      .catch((e) => {
        console.log(e);
        this.nsConn.emit("finish", this.settingId);
        alert("抽奖失败！");
      });
  }
  // 监听键盘事件
  listenUserAction() {
    var action = (even: KeyboardEvent) => {
      const keyName = even.key;
      if (!this.animationHasStart) {
        console.log("抽奖还没开始，不能操作");
        return;
      }
      switch (keyName) {
        // 空格键抽奖
        case " ":
          this.animationHasStart = false;
          this.doLottery();
          break;
      }
    };
    document.addEventListener("keyup", action);
  }

  onStartLottery() {
    this.setState({ isLotteryActive: false });
  }

  onStopLottery() {
    this.setState({ isLotteryActive: true });
  }

  onAddSpeed() {
    let speed = this.state.speed + 1;

    if (speed >= 30) {
      speed = 30;
    }

    this.setState({ speed: speed });
  }

  onReduceSpeed() {
    let speed = this.state.speed - 1;
    if (speed <= 10) {
      speed = 10;
    }
    this.setState({ speed: speed });
  }

  render() {
    const title = this.state.percent === 0 ? "抽奖" : "抽奖启动中...";
    return (
      <>
        <video id="background-video" loop autoPlay muted>
          <source src={`${this.resourceUrl}/background.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="screen-box">
          <div className="screen">
            {/* 抽奖动画渲染 s*/}
            <div className="stage">
              <canvas width={1920} height={600} ref={this.myRef}></canvas>
              {this.state.isLotteryActive && (
                <img
                  className="boss-img"
                  src={`${this.resourceUrl}/boss_bg.png`}
                />
              )}
            </div>
            {/* 抽奖动画渲染 e*/}

            {/* 抽奖按钮 s */}
            <div className="action">
              {this.state.isLotteryActive ? (
                <img
                  onClick={() => this.onStartLottery()}
                  width={375}
                  height={86}
                  src={`${this.resourceUrl}/start_btn.png`}
                  alt=""
                />
              ) : (
                <img
                  onClick={() => this.onStopLottery()}
                  width={375}
                  height={86}
                  src={`${this.resourceUrl}/stop_btn.png`}
                  alt=""
                />
              )}
              <p>抽奖源码：https://github.com/JX3BOX/lottery</p>
            </div>
            {/* 抽奖按钮 e */}

            {/* 滚动设置 s */}
            <div className="speed-box">
              <div className="tip-box">
                <p className="text">滚动速度</p>
                <p className="speed-num">{this.state.speed}</p>
              </div>
              <div className="triangle-box">
                <div
                  className="triangle-up"
                  onClick={() => this.onAddSpeed()}
                ></div>
                <div
                  className="triangle-down"
                  onClick={() => this.onReduceSpeed()}
                ></div>
              </div>
            </div>
            {/* 滚动设置 e */}

            {/* 弹窗 s */}
            <Modal
              title={title}
              open={this.state.visible}
              centered={true}
              closable={false}
              footer={null}
              keyboard={false}
              maskClosable={false}
            >
              {this.state.percent === 0 ? (
                <h2>准备中...</h2>
              ) : (
                <Progress percent={this.state.percent} />
              )}
            </Modal>
            {/* 弹窗 e */}
          </div>
        </div>
      </>
    );
  }
}
export default withRouter(Page);
