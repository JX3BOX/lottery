
import React from 'react';
import { Table, Space, Tag, Button } from "antd"
import { withRouter, RouteComponentProps } from "react-router-dom"

interface IState {
    settingList: Array<SettingItem>
}
interface SettingItem {

}
class Component extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props)
        this.state = {
            settingList: []
        }
    }
    componentDidMount() {

        this.loadData()
    }
    resetSetting(id) {
        const verityCode = prompt(`是否确定重置本次抽奖结果? 输入 ${id} 后确定`)
        if (verityCode !== id + "") {
            return
        }
        console.log("reset")
        // TODO 重置API
    }
    loadData() {
        fetch("/api/setting", { method: "GET" }).then((response) => { return response.json() }).then((data) => {
            console.log(data)
            if (data.code === 0) {
                this.setState({ settingList: data.data })
            }
        })
    }
    private columns = [
        {
            title: "序号",
            dataIndex: "index",
            render: (t, r, idx) => { return idx + 1 }
        },
        {
            title: '用户池',
            dataIndex: 'pool',
        },
        {
            title: '奖品配置',
            dataIndex: 'rule',
            render: (value) => {
                var tagColor = ["magenta", "red", "orange", "cyan", "blue"]
                return <>
                    {value.map((tag, index) => {
                        let color = tagColor[index % tagColor.length]
                        return (
                            <Tag color={color} key={index}>
                                {`${tag.award_name} ${tag.count}`}
                            </Tag>
                        );
                    })}
                </>
            }
        },
        {
            title: '抽奖已完成',
            dataIndex: 'status',
            render: (value) => { return value === 0 ? "否" : "是" }
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {
                return record.status === 0 ? (
                    <Space size="middle" >
                        <Button type="link" onClick={() => { this.goto(`/lottery/${record.id}`) }}>去抽奖</Button>
                    </Space>) :
                    (<Space size="middle" >
                        <Button type="link" onClick={() => { this.resetSetting(record.id) }}>重置[todo]</Button>
                    </Space>
                    )
            }
        },
    ]
    goto(url) {
        this.props.history.push(url)
    }
    genDemoData() {

    }
    render() {
        return <Table dataSource={this.state.settingList} columns={this.columns} rowKey="id" />
    }
}

export default withRouter(Component)
