import React from "react";
import {
  Link,
  withRouter,
  Switch,
  Route,
  RouteComponentProps,
} from "react-router-dom";
import { Layout, Menu } from "antd";
import "./home/index.scss";
import SettingList from "./home/setting";
import LuckyPeople from "./home/lucky-people";
import Config from "./home/config";
import Readme from "./home/readme";
import Award from "./home/award";
const { Header, Content, Footer } = Layout;

interface IState {
  current: string;
}

class Page extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = { current: "12" };
  }
  handleClick = (e) => {
    console.log("click ", e);
    this.setState({ current: e.key });
  };
  render() {
    let path = this.props.match.path;
    const { current } = this.state;
    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            onClick={this.handleClick}
            selectedKeys={[current]}
          >
            <Menu.Item key="1">
              <Link to="https://www.jx3box.com">JX3BOX</Link>{" "}
            </Menu.Item>
            <Menu.Item key="12">
              <Link to={`${path}/`}>抽奖ing</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to={`${path}/lucky`}>中奖名单</Link>
            </Menu.Item>
            {/* <Menu.Item key="3"><Link to={`${path}/award`}>奖品配置</Link> </Menu.Item> */}
            {/* <Menu.Item key="5">用户池配置</Menu.Item> */}
            <Menu.Item key="6">
              <Link to={`${path}/config`}>高级配置</Link>
            </Menu.Item>
            <Menu.Item key="7">
              <Link to={`${path}/readme`}>操作说明</Link>{" "}
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Switch>
            <Route exact path={`${path}/`} component={SettingList} />
            <Route exact path={`${path}/lucky`} component={LuckyPeople} />
            <Route exact path={`${path}/award`} component={Award} />
            <Route path={`${path}/config`} component={Config} />
            <Route exact path={`${path}/readme`} component={Readme} />
          </Switch>
        </Content>
        <Footer style={{ textAlign: "center" }}>©2020 JX3BOX.com</Footer>
      </Layout>
    );
  }
}

export default withRouter(Page);
