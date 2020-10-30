import React from 'react';
import { Layout, Menu, Tabs } from 'antd';
import "./home/index.scss"
import SettingList from "./home/setting"
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
export default class Page extends React.Component<any> {
    render() {
        return (
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Menu theme="dark" mode="horizontal">
                        <Menu.Item key="1">nav 1</Menu.Item>
                        <Menu.Item key="2">nav 2</Menu.Item>
                        <Menu.Item key="3">nav 3</Menu.Item>
                    </Menu>
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Tabs defaultActiveKey="1" centered>
                        <TabPane tab="Tab 1" key="1">
                            <SettingList />
                        </TabPane>
                        <TabPane tab="Tab 2" key="2">
                            Content of Tab Pane 2
                        </TabPane>
                        <TabPane tab="Tab 3" key="3">
                            Content of Tab Pane 3
                        </TabPane>
                    </Tabs>
                </Content>
                <Footer style={{ textAlign: 'center' }}>©2020 JX3BOX.com</Footer>
            </Layout>
        )
    }
}