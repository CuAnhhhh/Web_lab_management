import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createTemplate } from "src/PortalPages/api/TemplateApi";
import {
  FileUploadPropsRef,
  FileUpload,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Template } from "src/PortalPages/model/TemplateModel";
import style from "./TemplateForm.module.scss";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

export interface ITemplateFormRef {
  openPanel: (value?: string) => void;
}

interface ITemplateForm {
  trigger?: () => void;
  template?: Template.TemplateListModel;
}

const Component = (
  { trigger, template }: ITemplateForm,
  ref: Ref<ITemplateFormRef>
) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const [id, setId] = useState<string>();
  const { openLoading, closeLoading } = useLoading();
  const [sameName, setSameName] = useState<boolean>(false);
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  useEffect(() => {
    if (id) {
      uploadRef?.current?.setServiceId(id);
      form.setFieldValue("templateName", template?.templateName);
      form.setFieldValue("description", template?.description);
    }
  }, [id]);

  useEffect(() => {
    sameName && form.validateFields(["templateName"]);
  }, [sameName]);

  const openPanel = (value?: string) => {
    setId(value);
    setOpen(true);
  };

  const closePanel = () => {
    setOnChangeForm(false);
    setOpenModal(false);
    form.resetFields();
    setId(undefined);
    uploadRef?.current?.resetUpload();
    setOpen(false);
  };

  const submitForm = async () => {
    const model: Template.TemplateListModel = {
      templateId: id,
      templateName: form.getFieldValue("templateName"),
      description: form.getFieldValue("description"),
      projectId: userData?.projectId,
      createdBy: userData?.studentId,
      createdDate: dayjs().format(),
    };

    try {
      openLoading();
      const result = await createTemplate(model);
      if (result?.isDone) {
        if (!id) {
          await uploadRef?.current?.uploadFuntion(result?.id ?? "");
        }
        notification.open({
          message: "Create template successed",
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
      title={id ? "Edit a template" : "Create a template"}
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
          label="Template name"
          name="templateName"
          rules={[
            {
              required: true,
              message: "Add a template name!",
            },
            {
              validator: async () => {
                if (sameName) {
                  return Promise.reject(
                    new Error("There is a template with the same name!")
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
            rows={10}
            style={{ resize: "none" }}
            onBlur={(e) =>
              form.setFieldValue("description", e.target.value.trim())
            }
          />
        </Form.Item>
        <Form.Item label="Documents">
          <FileUpload serviceType="templates" ref={uploadRef} />
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
          Do you want to cancel create template. All infomation will be removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export const TemplateForm = forwardRef(Component);
