import React from "react";
import {
  Table,
  Space,
  Tag,
  Button,
  Form,
  InputNumber,
  Row,
  Col,
  Divider,
  Typography,
  Select,
  notification,
} from "antd";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as neffos from "neffos.js";
const { Title } = Typography;

const { Option } = Select;
interface IState {
  settingList: Array<SettingItem>;
  awardList: Array<any>;
  userPoolList: Array<string>;
}
interface SettingItem {}
class Component extends React.Component<RouteComponentProps, IState> {
  private nsConn: neffos.NSConn = null;
  constructor(props) {
    super(props);
    this.state = {
      settingList: [],
      awardList: [],
      userPoolList: [],
    };
  }
  private awardMap: any = {};
  async componentDidMount() {
    this.loadOptions();
    this.loadData();

    const conn = await neffos.dial(
      `${process.env.REACT_APP_WS_URL}/sync-action`,
      {
        default: {
          // "default" namespace.
          finish: (nsConn, msg) => {
            // "chat" event.
            console.log("完成抽奖:", msg.Body);
            this.nowRunninId = "";
            this.loadData();
          },
        },
      }
    );

    // You can either wait to conenct or just conn.connect("connect")
    // and put the `handleNamespaceConnectedConn` inside `_OnNamespaceConnected` callback instead.
    // const nsConn = await conn.connect("default");
    // nsConn.emit(...); handleNamespaceConnectedConn(nsConn);
    this.nsConn = await conn.connect("default");
  }
  resetSetting(id) {
    const verityCode = prompt(`是否确定重置本次抽奖结果? 输入 ${id} 后确定`);
    if (verityCode !== id + "") {
      return;
    }
    console.log("reset");
    // TODO 重置API
  }
  loadData() {
    fetch("/api/setting", { method: "GET" })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.code === 0) {
          this.setState({ settingList: data.data });
        }
      })
      .catch((e) => {
        alert(e);
      });
  }
  loadOptions() {
    fetch("/api/award")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.code === 0) {
          this.setState({ awardList: data.data || [] });
          data.data?.forEach((award) => {
            this.awardMap[award.id] = award;
          });
        }
      })
      .catch((e) => {
        alert(e);
      });

    fetch("/api/user-pool-list")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.code === 0) {
          this.setState({ userPoolList: data.data || [] });
          console.log(data.data);
        }
      })
      .catch((e) => {
        alert(e);
      });
  }
  postToServer(record) {}
  private columns = [
    {
      title: "序号",
      dataIndex: "index",
      render: (t, r, idx) => {
        return idx + 1;
      },
    },
    {
      title: "用户池",
      dataIndex: "pool",
    },
    {
      title: "奖品配置",
      dataIndex: "rule",
      render: (value) => {
        var tagColor = ["magenta", "red", "orange", "cyan", "blue"];
        return (
          <>
            {value.map((tag, index) => {
              let color = tagColor[index % tagColor.length];
              return (
                <Tag color={color} key={index}>
                  {`${tag.award_name} * ${tag.count}`}
                </Tag>
              );
            })}
          </>
        );
      },
    },
    {
      title: "抽奖已完成",
      dataIndex: "status",
      render: (value) => {
        return value === 0 ? "否" : "是";
      },
    },
    {
      title: "操作",
      key: "action",
      render: (text, record) => {
        var list = [];
        if (record.status === 0) {
          return (
            <Space size="middle">
              <Button
                type="link"
                onClick={() => {
                  this.startLotter(record);
                }}
              >
                启动该轮
              </Button>
            </Space>
          );
        }
        list.push(
          <Button type="link" style={{ color: "green" }}>
            完成
          </Button>
        );

        // if (record.status === 1) {
        //     list.push(<Button type="link" onClick={() => { this.postToServer(record) }}>上传到远程服务器</Button>)
        // }
        // if (record.status === 2) {
        //     <Button type="link" style={{ color: 'green' }}>已上传</Button>
        // }

        return (
          <Space size="middle">
            {list.map((record) => {
              return record;
            })}
          </Space>
        );
      },
    },
  ];
  goto(url) {
    this.props.history.push(url);
  }
  private nowRunninId = "";
  startLotter(record: any) {
    if (this.nowRunninId !== "") {
      notification.info({
        message: `有抽奖正在进行中，请等待结束后再尝试`,
        placement: "bottomRight",
      });
      return;
    }
    this.nowRunninId = record.id;
    record.hasStart = true;

    this.nsConn.emit("next", record.id + "");
  }
  onFinish(v) {
    console.log(v);
    if (!v.award || !v.count || v.count < 1 || v.pool == null) {
      alert("请填写相关数据！");
      return;
    }
    if (!v.repeat || v.repeat < 1) {
      v.repeat = 1;
    }
    const data = {
      pool: v.pool,
      rule: [
        {
          award_id: v.award,
          count: v.count,
          award_name: this.awardMap[v.award].name,
          award_image: this.awardMap[v.award].image,
        },
      ],
    };
    console.log(data);
    var list = [];
    for (var i = 0; i < v.repeat; i++) {
      list.push(
        fetch("/api/setting", { method: "POST", body: JSON.stringify(data) })
      );
    }
    Promise.all(list)
      .then(() => {
        this.loadData();
      })
      .catch((e) => {
        alert(e);
      });

    // fetch("/api/setting", { method: "POST", body: JSON.stringify(data) }).then((response) => { return response.json() }).then((d) => {
    //     console.log(d)
    //     this.loadData()
    // }).catch((e) => {
    //     alert(e)
    // })
  }
  render() {
    return (
      <Row style={{ height: "900px", overflow: "auto" }}>
        <Col span={24}>
          <Title level={3}>添加抽奖次数</Title>
          <Form
            name="award"
            layout="inline"
            onFinish={(values) => {
              this.onFinish(values);
            }}
          >
            <Form.Item name="pool" label="用户池">
              <Select placeholder="选择用户池" style={{ width: 150 }}>
                {this.state.userPoolList?.map((pool) => {
                  let poolName = pool;
                  if (pool === "") {
                    poolName = "默认";
                  }
                  return (
                    <Option value={pool} key={pool}>
                      {poolName}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="award" label="奖品">
              <Select placeholder="选择奖品" style={{ width: 150 }}>
                {this.state.awardList?.map((award) => {
                  return (
                    <Option value={award.id} key={award.id}>
                      {award.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item name="count" label="抽取人数">
              <InputNumber
                placeholder="数量"
                type="number"
                style={{ width: 150 }}
              />
            </Form.Item>
            <Form.Item name="repeat" label="抽取次数">
              <InputNumber
                placeholder="抽取次数"
                type="number"
                style={{ width: 150 }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                新增
              </Button>
              <Button
                type="link"
                onClick={() => {
                  window.open("/#/lottery", "_blank");
                }}
              >
                去抽奖
              </Button>
            </Form.Item>
          </Form>
          <Divider />
          <Table
            dataSource={this.state.settingList}
            columns={this.columns}
            rowKey="id"
            pagination={false}
          />
        </Col>
      </Row>
    );
  }
}

export default withRouter(Component);
