import React from 'react';

import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default class Component extends React.Component {

    render() {
        return (<Typography>
            <Title level={2}>使用:</Title>
            <Paragraph>1. 如果要测试，在'高级配置'中，先点击生成”测试配置“，然后点击“读取配置数据” </Paragraph>
            <Paragraph>2. 如果已经在生产环境配置好数据，在数据配置中，点击“读取配置数据” </Paragraph>
            <Paragraph>3. 抽奖结束后， 按ESC 键退出抽奖， 抽奖进行时按F11进行全屏。 按 空格键 暂停动画开始抽奖 </Paragraph>
        </Typography>)
    }
}