import { CloseOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification } from "antd";
import Select from "antd/es/select";
import dayjs from "dayjs";
import { deleteProject } from "src/PortalPages/api/ProjectApi";
import { Project } from "src/PortalPages/model/ProjectModel";
import style from "./RemoveProject.module.scss";

interface IRemoveProject {
  open?: boolean;
  closePanel?: () => void;
  projectList?: { label: string; value: string }[];
}

const RemoveProject = ({ open, closePanel, projectList }: IRemoveProject) => {
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");

  const onClose = () => {
    form.resetFields();
    closePanel?.();
  };

  const submitForm = async () => {
    const model: Project.DeleteProjectModel = {
      projectId: form.getFieldValue("projectId"),
      removedBy: userData?.studentId,
      removedDate: dayjs().format(),
      reason: form.getFieldValue("reason"),
    };

    try {
      const result = await deleteProject(model);
      if (result?.isDone) {
        notification.open({
          message: "Delete project successed",
          type: "success",
        });
        form.resetFields();
        closePanel?.();
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
      title="Remove a project"
      open={open}
      width={720}
      extra={<Button type="text" onClick={onClose} icon={<CloseOutlined />} />}
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={form.submit} type="primary">
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={submitForm}>
        <Form.Item
          label="Project"
          name="projectId"
          rules={[
            {
              required: true,
              message: "Choose a project to remove!",
            },
          ]}
        >
          <Select options={projectList} style={{ height: 40 }} />
        </Form.Item>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[
            {
              required: true,
              message: "Input a reason!",
            },
          ]}
        >
          <Input.TextArea rows={5} style={{ resize: "none" }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default RemoveProject;
