# 优享智慧园区管理系统
### 访问地址
🌐 **https://park-management-platform-dy-6p3p.vercel.app/**
## 项目简介
智慧园区管理系统基于现代信息技术打造，集成物联网、大数据、人工智能相关能力，通过前端技术实现园区全维度智能化管理。系统覆盖园区楼宇、车辆、报修、合同、设备等核心管理模块，实现能源监控、权限管控、数据可视化等功能，大幅提升园区运营效率，降低管理成本，为园区工作与居住人群提供智能、便捷、高效的服务体验。

## 技术栈
| 技术类别 | 核心技术/工具 |
| ---- | ---- |
| 前端框架 | React 18 |
| 类型校验 | TypeScript |
| 状态管理 | Redux Toolkit (RTK) |
| 路由管理 | react-router v6.4 |
| UI组件库 | Ant Design (antd) |
| 构建工具 | Webpack、create-react-app |
| 数据可视化 | ECharts、echarts-for-react |
| 样式预处理 | Sass/Scss |
| 网络请求 | Axios（二次封装） |
| 数据模拟 | Mock.js |
| 文件导出 | xlsx、file-saver、@react-pdf/renderer |

## 项目环境搭建
### 1. 初始化项目
```bash
# 使用create-react-app的ts模板创建项目
npm create vite@latest my-app -- --template react-ts
cd my-app
```

### 2. 安装核心依赖
```bash
# 路由
npm install react-router-dom
# UI组件库
npm install antd --save
# 样式预处理
npm install sass
# 网络请求与数据模拟
npm install axios mockjs
# 数据可视化
npm install echarts echarts-for-react
# 文件导出
npm install xlsx file-saver @react-pdf/renderer
```

### 3. 开发与打包
```bash
# 启动开发环境
npm start
# 生产环境打包
npm run build
```

### 4. 类型声明补充（Mock.js）
在`src/react-app-env.d.ts`中添加声明，解决Mock.js类型报错：
```typescript
/// <reference types="react-scripts" />
declare module 'mockjs'
```

## 核心功能模块
1. **系统基础能力**：登录鉴权、权限控制（路由 / 按钮级别）、动态路由、面包屑导航、菜单动态生成
2. **园区数据看板**：能源消耗等核心数据可视化展示（ECharts）
3. **园区资源管理**：楼宇、房间、车辆（充电记录 / 车辆列表）全生命周期管理
4. **园区财务管理**：合同管理、账单管理（Excel/PDF 导出）、费用统计
5. **系统管理**：设备管理、系统设置、个人中心、用户权限配置
6. **通用能力**：表格分页、数据缓存、跨页选择、表单校验、Mock 数据模拟

## 核心技术实现
### 1. Axios二次封装
实现请求拦截器（添加Bearer Token）、响应拦截器（统一错误处理、数据格式化），封装通用get/post方法：
```typescript
import axios,{AxiosInstance,InternalAxiosRequestConfig,AxiosResponse} from "axios";
import { message } from "antd";
import { store } from "../../store";

const http:AxiosInstance=axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout:5000
})

// 请求拦截器
http.interceptors.request.use((config:InternalAxiosRequestConfig)=>{
  const {token}=store.getState().authSlice
  if(token){
    config.headers['Authorization']=`Bearer ${token}`
  }
  return config
})

// 响应拦截器
http.interceptors.response.use((response:AxiosResponse)=>{
  const res=response.data
  if(res.code!==200){
    message.error(`${res.code}:${res.message}`);
    return Promise.reject(new Error(res.message))
  }
  return response.data
})

export default http
```

### 2. 权限控制
#### 路由级别权限
封装`RequireAuth`高阶组件，控制未登录/已登录用户路由访问权限：
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Iprops{
  allowed:boolean;
  redirectTo:string;
  children:React.ReactNode;
}

function RequireAuth({ allowed, redirectTo,children }:Iprops) {
  const isLoggedIn = !!sessionStorage.getItem('token');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (allowed !== isLoggedIn) {
      navigate(redirectTo);
    }
  }, [allowed, isLoggedIn, navigate, redirectTo]);

  return allowed === isLoggedIn ? <>{children}</> : null;
}

export default RequireAuth;
```

#### 按钮级别权限
封装`withPermissions`高阶组件，根据用户权限控制按钮显示/隐藏：
```typescript
function withPermissions(requiredPermissions:string[],userPermissions:string[]): (Component: React.FC) => React.FC {
  return function (Component: React.FC): React.FC {
    return function (props: any): React.ReactElement | null {
      const hasPermission: boolean = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );
      if (!hasPermission) return null;
      return <Component {...props} />;
    };
  };
}

export default withPermissions;
```

### 3. 动态路由生成
根据后端返回菜单数据，递归转换为react-router路由对象，实现权限化路由加载：
```typescript
import { RouteObject } from "react-router-dom";
import { componentMap } from "../router/routerMap";

interface MenuType{
  icon:string;
  key:string;
  label:string;
  children?:MenuType[];
}

export function generateRoutes(menu:MenuType[]):RouteObject[]{
  return menu.map((item:MenuType)=>{
    const hasChildren=item.children;
    let routerObj:RouteObject={
      path:item.key,
      element:hasChildren?null:<>{componentMap[item.key]}</>
    };
    if(item.children){
      routerObj.children=generateRoutes(item.children);
    }
    return routerObj;
  })
}
```

### 4. 数据可视化（ECharts）
异步请求获取数据，动态更新ECharts配置，实现园区能源消耗折线图展示：
```typescript
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { getEnergyData } from '../../api/dashboard';

const Dashboard = () => {
  const initialOption = {
    title: { text: '当日能源消耗' },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '24:00'] },
    yAxis: { type: 'value' },
    series: []
  };
  const [option, setOption] = useState(initialOption);

  useEffect(() => {
    const loadData = async () => {
      const { data: apiData } = await getEnergyData();
      const dataList = apiData.map((item:any) => ({
        name: item.name,
        data: item.data,
        type: 'line',
        stack: 'Total'
      }));
      setOption({
        ...option,
        legend: { data: dataList.map((item:any) => item.name) },
        series: dataList
      });
    };
    loadData();
  }, []);

  return <ReactECharts option={option} />;
};

export default Dashboard;
```

### 5. 文件导出
#### Excel导出
```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportToExcel = (selectedRows: any[]) => {
  const ws = XLSX.utils.json_to_sheet(selectedRows, {
    header: ['accountNo', 'status', 'roomNo', 'carNo', 'tel', 'money']
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "账单数据");
  const buf = XLSX.write(wb, {bookType:'xlsx', type:'buffer'});
  saveAs(new Blob([buf],{type:"application/octet-stream"}), "园区账单.xlsx");
};
```

#### PDF导出
基于`@react-pdf/renderer`实现自定义PDF文档导出，支持账单数据个性化渲染。

### 6. 自定义Hook（useDataList）
封装通用数据请求Hook，实现分页、筛选、加载状态管理，复用性强：
```typescript
import { useState, useEffect, useCallback } from 'react';

type FormData = { [key: string]: any };
interface DataFetcher<T> { (args: T & { page: number; pageSize: number }): Promise<any>; }

function useDataList<T extends FormData,U>(initialFormData: T, fetchData: DataFetcher<T>) {
  const [dataList, setDataList] = useState<U[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<T>(initialFormData);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data:{list,total} } = await fetchData({ ...formData, page, pageSize });
      setDataList(list);
      setTotal(total);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, page, pageSize, fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onChange = (pageNumber: number, pageSizeNumber: number) => {
    setPage(pageNumber);
    setPageSize(pageSizeNumber);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  return {
    dataList, page, pageSize, total, loading, formData,
    setFormData, loadData, onChange, handleChange
  };
}

export default useDataList;
```

## 环境变量配置
项目支持多环境配置，基于create-react-app内置能力，变量名必须以**REACT_APP_** 开头。
### 配置文件
- `.env`：默认环境变量（所有环境生效）
- `.env.development`：开发环境变量
- `.env.production`：生产环境变量
- `.env.local`：本地开发专用（不提交版本库）

### 配置示例
```
# .env.development
REACT_APP_API_URL = https://dev-api.zhihuayuan.com
# .env.production
REACT_APP_API_URL = https://api.zhihuayuan.com
```

### 使用方式
```typescript
const baseURL = process.env.REACT_APP_API_URL;
```


## 测试账号
```
用户名：admin
密码：admin123123
权限：全功能权限 + 所有按钮操作权限
```
```
用户名：manager
密码：manager123123
```
```
用户名：user
密码：user123123
```

## 项目亮点
1. **全栈TypeScript开发**：全程类型约束，杜绝any类型（特殊场景除外），提升代码可维护性与可读性
2. **精细化权限控制**：实现路由级别+按钮级别双重权限管控，适配园区多角色管理需求
3. **代码高复用性**：封装通用自定义Hook、高阶组件、公共工具函数，抽离公共逻辑，减少代码冗余
4. **性能优化**：使用React.memo、useCallback、useMemo减少不必要重渲染；路由懒加载；表格分页异步请求
5. **工程化配置**：支持多环境变量、Mock数据模拟、标准化目录结构，符合企业级开发规范
6. **丰富的功能拓展**：支持Excel/PDF文件导出、数据可视化、表格跨页选择、页面数据缓存等企业级功能

## 目录结构
```
├── public/          # 公共静态资源（图片、图标等，CSS引入图片放此目录）
├── src/
│   ├── api/         # 接口请求管理（按模块划分）
│   ├── assets/      # 项目静态资源（图片、全局样式、图标等）
│   ├── components/  # 公共组件（面包屑、按钮、权限高阶组件等）
│   ├── hooks/       # 自定义Hook（useDataList等）
│   ├── mock/        # Mock数据配置（接口模拟）
│   ├── page/        # 业务页面（按模块划分）
│   │   ├── login/       # 登录页
│   │   ├── dashboard/   # 数据看板
│   │   ├── building/    # 楼宇管理
│   │   ├── car/         # 车辆管理
│   │   ├── repair/      # 报修管理
│   │   ├── contract/    # 合同管理
│   │   ├── bill/        # 账单管理
│   │   ├── device/      # 设备管理
│   │   ├── system/      # 系统设置
│   │   └── user/        # 个人中心
│   ├── router/      # 路由配置（静态路由、动态路由生成、路由映射）
│   ├── store/       # Redux状态管理（按模块划分slice）
│   ├── utils/       # 工具函数（Axios封装、通用工具）
│   ├── App.tsx      # 根组件
│   ├── index.tsx    # 项目入口
│   └── react-app-env.d.ts # TS类型声明文件
├── .env.development # 开发环境变量
├── .env.production  # 生产环境变量
├── package.json     # 项目依赖与脚本
├── tsconfig.json    # TypeScript配置
└── README.md        # 项目说明文档
```
