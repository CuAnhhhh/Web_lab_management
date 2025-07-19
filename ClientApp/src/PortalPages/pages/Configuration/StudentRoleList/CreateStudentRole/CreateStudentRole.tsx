import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { createStudentRole } from "src/PortalPages/api/ConfigurationApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { Configuration } from "src/PortalPages/model/ConfigurationModel";
import style from "./CreateStudentRole.module.scss";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

export interface ICreateStudentRoleRef {
  openPanel: (value?: string) => void;
}

interface ICreateStudentRole {
  studentRole?: Configuration.StudentRoleListModel;
  trigger?: () => void;
}

const Component = (
  { trigger, studentRole }: ICreateStudentRole,
  ref: Ref<ICreateStudentRoleRef>
) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const [sameName, setSameName] = useState<boolean>(false);
  const [id, setId] = useState<string>();
  const { openLoading, closeLoading } = useLoading();
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  useEffect(() => {
    if (id) {
      form.setFieldValue("roleName", studentRole?.studentRoleName);
      form.setFieldValue("description", studentRole?.description);
    }
  }, [id]);

  const openPanel = (value?: string) => {
    setId(value);
    setOpen(true);
  };

  const closePanel = () => {
    setOnChangeForm(false);
    setOpenModal(false);
    form.resetFields();
    setId(undefined);
    setOpen(false);
  };

  useEffect(() => {
    sameName && form.validateFields(["roleName"]);
  }, [sameName]);

  const submitForm = async () => {
    const model: Configuration.StudentRoleListModel = {
      studentRoleId: id,
      studentRoleName: form.getFieldValue("roleName"),
      description: form.getFieldValue("description"),
      createdBy: userData?.studentId,
      createdDate: dayjs().format(),
    };

    try {
      openLoading();
      const result = await createStudentRole(model);
      if (result?.isDone) {
        notification.open({
          message: "Create student role successed",
          type: "success",
        });
        closePanel();
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
    closeLoading();
  };

  return (
    <Drawer
      title={id ? "Edit a student role" : "Create a student role"}
      open={open}
      width={720}
      extra={
        <Button
          type="text"
          onClick={onChangeForm ? () => setOpenModal(true) : closePanel}
          icon={<CloseOutlined />}
        />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button
            onClick={onChangeForm ? () => setOpenModal(true) : closePanel}
          >
            Close
          </Button>
          <Button onClick={form.submit} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        onChange={() => setOnChangeForm(true)}
      >
        <Form.Item
          label="Student role name"
          name="roleName"
          rules={[
            {
              required: true,
              message: "Add a student role name!",
            },
            {
              validator: async () => {
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
            size="large"
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
          <Input.TextArea
            rows={5}
            style={{ resize: "none" }}
            onBlur={(e) => form.setFieldValue("description", e.target.value.trim())}
          />
        </Form.Item>
      </Form>
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={closePanel}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel create student role. All infomation will be
          removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export const CreateStudentRole = forwardRef(Component);
