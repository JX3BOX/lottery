import React from 'react';
import { Layout, Menu, Tabs } from 'antd';
import "./home/index.scss"
import SettingList from "./home/setting"
import LuckyPeople from "./home/lucky-people"
import Config from "./home/config"
import Readme from "./home/readme"
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
export default class Page extends React.Component<any> {
    render() {
        return (
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Menu theme="dark" mode="horizontal">
                        <Menu.Item key="1">JX3BOX PVE抽奖</Menu.Item>
                    </Menu>
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Tabs defaultActiveKey="1" centered>
                        <TabPane tab="抽奖设置" key="1">
                            <SettingList />
                        </TabPane>
                        <TabPane tab="中奖名单" key="2">
                            <LuckyPeople />
                        </TabPane>
                        <TabPane tab="数据配置" key="3">
                            <Config />
                        </TabPane>
                        <TabPane tab="使用说明" key="4">
                            <Readme />
                        </TabPane>
                    </Tabs>
                </Content>
                <Footer style={{ textAlign: 'center' }}>©2020 JX3BOX.com</Footer>
            </Layout>
        )
    }
}