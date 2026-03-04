import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { routes } from "./router";
import { useEffect, useState, Suspense } from "react";
import { generateRoutes } from "./utils/generatesRoutes";
import { Spin } from "antd";
import { getMenu } from "./api/users";
import { useDispatch } from 'react-redux';
import { setMenu } from "./store/login/authSlice";
import { useSelector } from "react-redux";

function App() {
  console.log(process.env.REACT_APP_API_URL);
  const { token } = useSelector((state: any) => state.authSlice);
  const [router, setRouter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // 单独的加载状态控制
  const dispatch = useDispatch();

  useEffect(() => {
    // 定义一个清理函数，避免组件卸载后仍执行状态更新
    let isMounted = true;

    async function loadData() {
      setIsLoading(true); // 开始加载时强制显示加载状态
      try {
        const { data } = await getMenu();
        if (!isMounted) return; // 组件已卸载则终止

        if (data.length) {
          dispatch(setMenu(data));
          const dynamicRoutes = generateRoutes(data);
          // 合并静态路由和动态路由
          const myRoutes = [...routes];
          myRoutes[0].children = dynamicRoutes;
          // 确保默认路由正确设置 - 重定向到 dashboard
          if (myRoutes[0].children.length > 0) {
            myRoutes[0].children.unshift({
              index: true,
              element: <Navigate to="/dashboard" replace />
            });
          }
          setRouter(createBrowserRouter(myRoutes));
        } else {
          // 无动态路由时使用静态路由
          setRouter(createBrowserRouter(routes));
        }
      } catch (error) {
        console.error("加载路由失败:", error);
        // 出错时也使用静态路由兜底
        setRouter(createBrowserRouter(routes));
      } finally {
        if (isMounted) {
          setIsLoading(false); // 无论成功失败都结束加载状态
        }
      }
    }

    loadData();

    // 组件卸载时标记
    return () => { isMounted = false; };
  }, [token, dispatch]); // 依赖项补充完整

  // 关键：路由未准备好或正在加载时，始终显示Spin，不渲染任何路由相关内容
  if (isLoading || !router) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 路由准备就绪后再渲染RouterProvider
  return (
    <div className="App">
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin size="large" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}

export default App;