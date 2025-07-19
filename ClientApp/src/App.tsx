import { Layout, notification } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import style from "./App.module.scss";
import CustomBreadcrumb from "./PortalPages/component/CustomBreadcrumb/CustomBreadcrumb";
import { LoadingProvider } from "./PortalPages/component/CustomLoading/CustomLoading";
import LeftNav from "./PortalPages/component/LeftNav/LeftNav";
import UserAccount from "./PortalPages/component/UserAccount/UserAccount";
import Login from "./PortalPages/pages/Login";
import CustomRouter from "./PortalPages/pages/Router";

const { Content, Sider } = Layout;

const App = () => {
  const userData = localStorage.getItem("userData");

  useEffect(() => {
    if (!userData) {
      window.history.pushState(null, "", "/login");
    }
  }, []);

  // useEffect(() => {
  //   if (!!userData && JSON.parse(userData)?.studentId != "0") {
  //     const [_, cookieValue] = document.cookie.split("=");
  //     if (dayjs().diff(cookieValue, "minute") >= 5) {
  //       localStorage.clear();
  //       window.history.pushState(null, "", "/login");
  //       notification.open({
  //         message: "Please login again to use system",
  //         type: "warning",
  //       });
  //     }

  //     setTimeout(() => {
  //       localStorage.clear();
  //       window.history.pushState(null, "", "/login");
  //       notification.open({
  //         message: "Please login again to use system",
  //         type: "warning",
  //       });
  //     }, 5 * 60 * 1000);
  //   }
  // }, []);

  return (
    <LoadingProvider>
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
              <CustomRouter />
            </Content>
          </BrowserRouter>
        ) : (
          <Login />
        )}
      </Layout>
    </LoadingProvider>
  );
};

export default App;
