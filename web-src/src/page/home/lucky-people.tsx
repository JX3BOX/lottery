
import React from 'react';
import LuckyRecords from './lucky-record'
import { notification, Card, Row, Col } from 'antd';

interface IProps {

}
interface SettingItem {

}
interface IState {
    settingList: Array<SettingItem>
}

export default class Component extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            settingList: []
        }
        this.loadData()
    }


    async loadData() {
        return new Promise((resolve, reject) => {
            fetch("/api/setting", { method: "GET" }).then((response) => { return response.json() }).then((data) => {
                if (data.code === 0) {
                    console.log(data.data)
                    this.setState({ settingList: data.data })
                } else {
                    notification.error({ placement: "bottomRight", description: JSON.stringify(data), message: "错误" })
                }
            }).catch((e) => {
                notification.error({ placement: "bottomRight", description: e.message, message: "错误" })
            })
        })
    }
    render() {
        if (!this.state.settingList) {
            return null
        }
        const settingIdList = this.state.settingList.map((item: any) => { return item.id })
        return (
            <Row style={{ height: "900px", overflow: "auto" }}>
                <Col span={24}>
                    {settingIdList.map((id: any, index: number) => {
                        return (
                            <Card title={"抽奖顺序:" + (index + 1)} key={id}>
                                <LuckyRecords id={id} />
                            </Card>
                        )
                    })}
                </Col>
            </Row>
        )
    }
}