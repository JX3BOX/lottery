
import { Button, Space } from 'antd';
import React from 'react';
export default class Component extends React.Component {
    genDemo() {
        fetch("/api/setting/demo")
    }
    readConfig() {
        fetch("/api/setting/config").then(() => {
            alert("读取完成！")
        })
    }
    resetDB() {
        fetch("/api/setting/config/reset").then(() => {
            alert("重置完成")
        })
    }
    render() {
        return (<Space align="center">
            <Button type="primary" onClick={this.genDemo} danger size="large">生成测试配置</Button>
            <Button type="primary" size="large" onClick={this.readConfig}>读取配置生成数据</Button>

            <Button type="primary" size="large" onClick={this.resetDB}>重置所有抽奖记录</Button>
        </Space>)
    }
}