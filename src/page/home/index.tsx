
import { Breadcrumb, Layout, theme } from 'antd';
import { useState } from 'react';
import NavLeft from '../../components/navLeft';
import MyBreadCrumb from '../../components/breadCrumb';
import MyHeader from '../../components/header';
import { Outlet } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
function Home() {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return <div className='home'>
        <Layout style={{ minHeight: '100vh' }}>
            <Sider className="fixed-sider" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{
                height: '100vh',  // 固定高度为视口高度
                position: 'fixed',  // 固定定位，不跟随页面滚动
                left: 0,  // 固定在左侧
                overflowY: 'auto',  // 当菜单过长时，自己出现滚动条
                zIndex: 1  // 避免被其他内容遮挡
            }}>
                <NavLeft />
            </Sider>
            <Layout style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: collapsed ? '80px' : '200px'  // 适配折叠/展开状态的宽度
            }}>
                <Header style={{ paddingRight: "20px", background: colorBgContainer, textAlign: "right" }}>
                    <MyHeader />
                </Header>
                <Content style={{ margin: '0 16px', flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                    <MyBreadCrumb />
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    </div>
}
export default Home





