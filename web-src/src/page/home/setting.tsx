
import React from 'react';
import { Table, Space } from "antd"
import { Link } from "react-router-dom"
interface IProps { }
interface IState {
    settingList: Array<SettingItem>
}
interface SettingItem {

}
export default class Component extends React.Component<IProps, IState> {
    constructor(props: IProps) {
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
            title: '用户池',
            dataIndex: 'pool',
        },
        {
            title: '是否已完成',
            dataIndex: 'status',
            render: (value) => { return value === 0 ? "否" : "是" }
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => {
                return record.status === 0 ? (<Space size="middle" >
                    <Link to={{ pathname: `/lottery/${record.id}` }}>抽奖</Link>
                    <a onClick={() => { this.resetSetting(record.id) }}>重置</a>
                </Space>) : <Space size="middle" >
                        <a onClick={() => { this.resetSetting(record.id) }}>重置</a>
                    </Space>
            }
        },
    ]
    render() {
        return <Table dataSource={this.state.settingList} columns={this.columns} rowKey="id" />;
    }
}