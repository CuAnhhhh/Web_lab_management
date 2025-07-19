import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification, Switch } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { createProjectType } from "src/PortalPages/api/ConfigurationApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import { Configuration } from "src/PortalPages/model/ConfigurationModel";
import style from "./CreateProjectType.module.scss";

export interface ICreateProjectTypeRef {
  openPanel: (value?: string) => void;
}

interface ICreateProjectType {
  projectType?: Configuration.ProjectTypeListModel;
  trigger?: () => void;
}

const Component = (
  { trigger, projectType }: ICreateProjectType,
  ref: Ref<ICreateProjectTypeRef>
) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const [sameName, setSameName] = useState<boolean>(false);
  const [id, setId] = useState<string>();
  const { openLoading, closeLoading } = useLoading();
  const [checked, setChecked] = useState<boolean>(true);
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  useEffect(() => {
    if (id) {
      setChecked(projectType?.isWeeklyReport ?? false);
      form.setFieldValue("typeName", projectType?.projectTypeName);
      form.setFieldValue("description", projectType?.description);
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
    setChecked(true);
    setOpen(false);
  };

  useEffect(() => {
    sameName && form.validateFields(["typeName"]);
  }, [sameName]);

  const submitForm = async () => {
    const model: Configuration.ProjectTypeListModel = {
      projectTypeId: id,
      projectTypeName: form.getFieldValue("typeName"),
      description: form.getFieldValue("description"),
      isWeeklyReport: checked,
      createdBy: userData?.studentId,
      createdDate: dayjs().format(),
    };

    try {
      openLoading();
      const result = await createProjectType(model);
      if (result?.isDone) {
        notification.open({
          message: "Create project type successed",
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
      title={id ? "Edit a project type" : "Create a project type"}
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
          label="Project type name"
          name="typeName"
          rules={[
            {
              required: true,
              message: "Add a project type name!",
            },
            {
              validator: async () => {
                if (sameName) {
                  return Promise.reject(
                    new Error("There is a project type with the same name!")
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
            onBlur={(e) =>
              form.setFieldValue("description", e.target.value.trim())
            }
          />
        </Form.Item>
        {id ? (
          <CustomText label="Is a weekly report project">
            {projectType?.isWeeklyReport ? "Yes" : "No"}
          </CustomText>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            <div className={style.label}>Is a weekly report project</div>
            <Switch
              value={checked}
              onChange={(checked: boolean) => {
                setChecked(checked);
              }}
            />
          </div>
        )}
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
          Do you want to cancel create project type. All infomation will be
          removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export const CreateProjectType = forwardRef(Component);
