
import React from 'react';
import { Image, Table, Form, Input, Button } from 'antd'
interface IProps { }
interface IState {
    awardList: Array<any>
}
export default class Component extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = {
            awardList: []
        }
    }
    loadData() {
        fetch("/api/award", { method: "GET" }).then((response) => { return response.json() }).then((data) => {
            if (data.code === 0) {
                this.setState({ awardList: data.data })
            } else {
                throw new Error(JSON.stringify(data))
            }
        }).catch((e) => {
            alert(e)
        })
    }
    componentDidMount() { }
    private columns = [
        {
            title: "ID",
            dataIndex: "id",
        },
        {
            title: '奖品',
            dataIndex: 'name',
        },
        // {
        //     title: '图片',
        //     dataIndex: 'image',
        //     render: (value) => {
        //         return <Image src={value}></Image>
        //     }
        // },
    ]
    onFinish(v) {
        fetch("/api/award", { method: "POST", body: JSON.stringify(v) }).then(() => {
            this.loadData()
        })
    }
    render() {
        return (
            <>
                <Form name="award" layout="inline" onFinish={(values) => { this.onFinish(values) }} >
                    <Form.Item name="id">
                        <Input placeholder="id" />
                    </Form.Item>
                    <Form.Item name="name">
                        <Input placeholder="奖品名称" />
                    </Form.Item>
                    <Form.Item shouldUpdate={true}>
                        <Button type="primary" htmlType="submit">新增</Button>
                    </Form.Item>
                </Form>
                <Table dataSource={this.state.awardList} columns={this.columns} rowKey="id" />
            </>
        )
    }
}