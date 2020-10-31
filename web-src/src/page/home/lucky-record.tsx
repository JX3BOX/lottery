import { notification } from 'antd';
import React from 'react';
import { Table, Avatar, Tabs } from "antd"
const { TabPane } = Tabs;
interface IProps {
    id: number;
}
interface IState {
    ruleList: Array<any>
}

export default class Component extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            ruleList: []
        }
        this.getLucky(this.props.id)
    }
    getLucky(id) {
        fetch('/api/lucky-people/at/setting/' + id).then((response) => { return response.json() }).then((data) => {
            if (data.code === 0) {
                console.log(data.data)
                this.setState({ ruleList: data.data })
            } else {
                notification.error({ placement: "bottomRight", description: JSON.stringify(data), message: "错误" })
            }
        }).catch((e: Error) => {
            notification.error({ placement: "bottomRight", description: e.message, message: "错误" })
        })
    }
    columns = [
        {
            title: "序号",
            dataIndex: "index",
            render: (t, r, idx) => { return idx + 1 }
        },
        {
            title: '用户',
            dataIndex: ["user", "name"],
            render: (t, r, idx) => {
                console.log(process.env.PUBLIC_URL + r.user.avatar)
                return (<div>
                    <Avatar src={process.env.PUBLIC_URL + r.user.avatar} />
                    {r.user.name}
                </div>)
            }
        },
        {
            title: '奖品',
            dataIndex: ["award", "name"],
        }
    ]
    render() {

        const pool = {}
        if (this.state.ruleList == null) {
            return (<></>)
        }
        this.state.ruleList.forEach((item) => {
            if (pool[item.award.id]) {
                pool[item.award.id].push(item)
            } else {
                pool[item.award.id] = [item]
            }

        })
        const keys = Object.keys(pool)
        return (
            <Tabs defaultActiveKey={keys[0]} centered>
                {Object.keys(pool).map((key) => {
                    const list = pool[key]
                    return <TabPane tab={list[0].award.name} key={key}>
                        <Table dataSource={list} columns={this.columns} rowKey={(r) => {
                            return r.lucky_people.setting_id + "_" + r.lucky_people.user_id
                        }} size="small" />
                    </TabPane>
                })}
            </Tabs>
        )

        // <Table dataSource={this.state.ruleList} columns={this.columns} rowKey={(r) => {
        //     return r.lucky_people.setting_id + "_" + r.lucky_people.user_id
        // }} size="small" />;
    }
}