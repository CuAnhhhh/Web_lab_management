import { CloseOutlined } from "@ant-design/icons";
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

export interface ITemplateFormRef {
  openPanel: (id?: string) => void;
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
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const [id, setId] = useState<string>();

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

  const openPanel = (id?: string) => {
    setId(id);
    setOpen(true);
  };

  const closePanel = () => {
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
      createdBy: userData?.studentId,
      createdDate: dayjs().format(),
    };

    try {
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
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <Drawer
      title={id ? "Edit a template" : "Create a template"}
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
          label="Template name"
          name="templateName"
          rules={[
            {
              required: true,
              message: "Add a template name!",
            },
          ]}
        >
          <Input style={{ height: 40 }} />
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
          <Input.TextArea rows={10} style={{ resize: "none" }} />
        </Form.Item>
        <Form.Item label="Documents">
          <FileUpload serviceType="templates" ref={uploadRef} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export const TemplateForm = forwardRef(Component);
