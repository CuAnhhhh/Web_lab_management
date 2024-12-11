import { CloseOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import style from "./CreateStudentRole.module.scss";
import { Configuration } from "src/PortalPages/model/ConfigurationModel";
import { createStudentRole } from "src/PortalPages/api/ConfigurationApi";

export interface ICreateStudentRoleRef {
  openPanel: () => void;
}

interface ICreateStudentRole {
  trigger?: () => void;
}

const Component = (
  { trigger }: ICreateStudentRole,
  ref: Ref<ICreateStudentRoleRef>
) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");
  const [sameName, setSameName] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  const openPanel = () => {
    setOpen(true);
  };

  const closePanel = () => {
    form.resetFields();
    setOpen(false);
  };

  useEffect(() => {
    sameName && form.validateFields(["roleName"]);
  }, [sameName]);

  const submitForm = async () => {
    const model: Configuration.StudentRoleListModel = {
      studentRoleName: form.getFieldValue("roleName"),
      description: form.getFieldValue("description"),
      createdBy: userData?.studentId,
      createdDate: dayjs().format(),
    };

    try {
      const result = await createStudentRole(model);
      if (result?.isDone) {
        notification.open({
          message: "Create student role successed",
          type: "success",
        });
        form.resetFields();
        setOpen(false);
        trigger?.();
      }
      if (result?.errorCode === 101) {
        setSameName(true);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <Drawer
      title={"Create a student role"}
      open={open}
      width={720}
      extra={
        <Button type="text" onClick={closePanel} icon={<CloseOutlined />} />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button onClick={closePanel}>Close</Button>
          <Button onClick={form.submit} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={submitForm}>
        <Form.Item
          label="Student role name"
          name="roleName"
          rules={[
            {
              required: true,
              message: "Add a student role name!",
            },
            {
              validator: () => {
                if (sameName) {
                  return Promise.reject(
                    new Error("There is a student role with the same name!")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            style={{ height: 40 }}
            placeholder="Input a name"
            onChange={() => sameName && setSameName(false)}
          />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: "Input a description!",
            },
          ]}
        >
          <Input.TextArea rows={5} style={{ resize: "none" }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export const CreateStudentRole = forwardRef(Component);
