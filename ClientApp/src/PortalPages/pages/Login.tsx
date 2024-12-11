import { Button, Form, Input, notification } from "antd";
import { StudentLogin } from "../api/StudentApi";
import { Common } from "../model/CommonModel";
import style from "./Login.module.scss";

const Login = () => {
  const [form] = Form.useForm();

  const onFinish = async () => {
    const data: Common.StudentLoginModel = {
      userName: form.getFieldValue("username"),
      passWord: form.getFieldValue("password"),
    };
    try {
      const result = await StudentLogin(data);
      if (result?.isCorrect) {
        localStorage.setItem(
          "userData",
          JSON.stringify({
            studentId: result?.studentId,
            studentRole: result?.studentRole,
          })
        );
        window.location.href = "http://localhost:3000/overview";
      } else {
        notification.open({
          message: "Wrong login data",
          type: "warning",
        });
      }
    } catch (e) {
      notification.open({
        message: "Wrong login data",
        type: "warning",
      });
    }
  };

  return (
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
        <Input style={{ height: 40 }} />
      </Form.Item>
      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password style={{ height: 40 }} />
      </Form.Item>
      <Button type="primary" className="commonButton" onClick={form.submit}>
        Submit
      </Button>
    </Form>
  );
};

export default Login;
