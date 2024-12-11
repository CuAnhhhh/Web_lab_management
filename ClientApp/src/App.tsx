import { Layout } from "antd";
import { BrowserRouter } from "react-router-dom";
import style from "./App.module.scss";
import CustomBreadcrumb from "./PortalPages/component/CustomBreadcrumb/CustomBreadcrumb";
import CustomLoading from "./PortalPages/component/CustomLoading/CustomLoading";
import LeftNav from "./PortalPages/component/LeftNav/LeftNav";
import UserAccount from "./PortalPages/component/UserAccount/UserAccount";
import CustomRouter from "./PortalPages/pages/Router";
import Login from "./PortalPages/pages/Login";
import { useEffect } from "react";

const { Content, Sider } = Layout;

const App = () => {
  const userData = localStorage.getItem("userData");

  useEffect(() => {
    if (!userData) {
      window.history.pushState(null, "", "/login");
    }
  }, []);

  return (
    <Layout style={{ height: "100vh" }}>
      {userData ? (
        <BrowserRouter>
          <Sider className={style.appSider}>
            <div className="demo-logo-vertical" />
            <LeftNav />
          </Sider>
          <Content className={style.appContent}>
            <CustomBreadcrumb />
            <UserAccount />
            <CustomLoading />
            <CustomRouter />
          </Content>
        </BrowserRouter>
      ) : (
        <Login />
      )}
    </Layout>
  );
};

export default App;
