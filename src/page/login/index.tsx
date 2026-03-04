import logo from "../../assets/logo.png"
import bg from "../../assets/bg.jpg"
import lgbg from "../../assets/lgbg.jpg"
import "./index.scss"
import { Button, Form, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from "../../api/users";
import { setToken } from "../../store/login/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Login() {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    function handleLogin() {
        form.validateFields().then(async (res) => {
            setLoading(true)
            const { data: { token, username, btnAuth } } = await login(res);
            setLoading(false)
            dispatch(setToken(token))
            sessionStorage.setItem("username", username)
            sessionStorage.setItem("btnAuth", JSON.stringify(btnAuth))
            navigate("/", { replace: true })
        }).catch((err) => {
            setLoading(false)
            console.log(err)
        })
    }

    return <div className="login" style={{ backgroundImage: `url(${bg})` }}>
        <div className="lgbg" style={{ backgroundImage: `url(${lgbg})` }}>
            <div className="part">
                <div className="title">
                    <div className="logo">
                        <img src={logo} width={100} />
                    </div>
                    <h1>优享智慧园区管理平台</h1>
                </div>
                <Form
                    form={form}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '用户名不能为空' },
                            { pattern: /^\w{4,8}$/, message: "用户名必须是4-8位数字字母组合" },
                        ]}
                    >
                        <Input placeholder="请输入您的用户名" prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '密码不能为空' }]}
                    >
                        <Input.Password placeholder="请输入您的密码" prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item >
                        <Button
                            type="primary"
                            style={{ width: "100%" }}
                            onClick={handleLogin}
                            loading={loading}
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
        {/* 右下角显示用户名和密码的盒子 */}
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 999
        }}>
            <div style={{ color: 'red', fontSize: '14px', fontWeight: 'bold' }}>系统账号</div>
            <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>admin / admin123123</div>
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>manager / manager123123</div>
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>user / user123123</div>
        </div>
    </div>
}




export default Login