
import React from 'react';
import { Typography, Table, Form, Input, Button, Row, Col, Divider, InputNumber } from 'antd'
const { Title } = Typography;

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
    componentDidMount() { this.loadData() }
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
        if (!v.id || !v.name) {
            alert("数据填写错误")
            return
        }
        fetch("/api/award", { method: "POST", body: JSON.stringify(v) }).then((response) => { return response.json() }).then((d) => {
            if (d.code !== 0) {
                throw new Error(JSON.stringify(d))
            }
            this.loadData()
        }).catch((e) => { alert(e) })
    }
    render() {
        return (
            <Row style={{ height: "900px", overflow: "auto" }}>
                <Col span={24}>
                    <Title level={3}>添加抽奖次数</Title>
                    <Form name="award" layout="inline" onFinish={(values) => { this.onFinish(values) }} >
                        <Form.Item name="id" label="奖品id">
                            <InputNumber placeholder="id不能重复" style={{ width: 150 }} />
                        </Form.Item>
                        <Form.Item name="name" label="奖品名称">
                            <Input placeholder="奖品名称" style={{ width: 150 }} />
                        </Form.Item>
                        <Form.Item shouldUpdate={true}>
                            <Button type="primary" htmlType="submit">新增</Button>
                        </Form.Item>
                    </Form>
                    <Divider />
                    <Table dataSource={this.state.awardList} columns={this.columns} rowKey="id" pagination={false} />
                </Col>
            </Row>
        )
    }
}