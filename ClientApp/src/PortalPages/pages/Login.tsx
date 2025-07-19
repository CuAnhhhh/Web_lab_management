import { IdcardOutlined, MobileOutlined } from "@ant-design/icons";
import { Button, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import { StudentLogin } from "../api/StudentApi";
import { useLoading } from "../component/CustomLoading/CustomLoading";
import { Common } from "../model/CommonModel";
import style from "./Login.module.scss";

const Login = () => {
  const [form] = Form.useForm();
  const { openLoading, closeLoading } = useLoading();

  const onFinish = async () => {
    const data: Common.StudentLoginModel = {
      userName: form.getFieldValue("username"),
      passWord: form.getFieldValue("password"),
    };
    try {
      openLoading();
      const result = await StudentLogin(data);
      if (result?.isCorrect) {
        localStorage.setItem(
          "userData",
          JSON.stringify({
            studentId: result?.studentId,
            studentRole: result?.studentRole,
            projectId: result?.projectId,
            isLeader: result?.isLeader,
            collaboration: result?.collaboration,
          })
        );
        document.cookie = `loginTime=${dayjs().format()}`;
        window.location.href = "http://26.243.146.110:3000/overview";
      } else {
        notification.open({
          message: "Wrong login data",
          type: "error",
        });
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  return (
    <div className={style.body}>
      <Form
        className={style.formLogin}
        form={form}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input
            size="large"
            prefix={<IdcardOutlined style={{ marginRight: 7 }} />}
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            size="large"
            prefix={<MobileOutlined style={{ marginRight: 7 }} />}
          />
        </Form.Item>
        <Button type="primary" className="commonButton" onClick={form.submit}>
          Log In
        </Button>
      </Form>
    </div>
  );
};

export default Login;
