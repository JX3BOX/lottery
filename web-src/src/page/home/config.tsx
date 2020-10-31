
import { Button, Space } from 'antd';
import React from 'react';
export default class Component extends React.Component {
    genDemo() {
        fetch("/api/setting/demo")
    }
    readConfig() {
        fetch("/api/setting/config").then(() => {
            window.location.reload()
        })
    }
    render() {
        return (<Space align="center">
            <Button type="primary" onClick={this.genDemo} danger size="large">生成测试配置</Button>
            <Button type="primary" size="large" onClick={this.readConfig}>读取配置生成数据</Button>
        </Space>)
    }
}