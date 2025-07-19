import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification } from "antd";
import Select from "antd/es/select";
import dayjs from "dayjs";
import { deleteProject } from "src/PortalPages/api/ProjectApi";
import { Project } from "src/PortalPages/model/ProjectModel";
import style from "./RemoveProject.module.scss";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { useState } from "react";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

interface IRemoveProject {
  open?: boolean;
  closePanel?: () => void;
  projectList?: { label: string; value: string }[];
}

const RemoveProject = ({ open, closePanel, projectList }: IRemoveProject) => {
  const [form] = Form.useForm();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const { openLoading, closeLoading } = useLoading();
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const onClose = () => {
    setOnChangeForm(false);
    setOpenModal(false);
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
      openLoading();
      const result = await deleteProject(model);
      if (result?.isDone) {
        notification.open({
          message: "Removed project successed",
          type: "success",
        });
        onClose();
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
      title="Remove a project"
      open={open}
      width={720}
      extra={
        <Button
          type="text"
          onClick={onChangeForm ? () => setOpenModal(true) : onClose}
          icon={<CloseOutlined />}
        />
      }
      closable={false}
      className={style.customPanel}
      footer={
        <div className={style.bottomButton}>
          <Button onClick={onChangeForm ? () => setOpenModal(true) : onClose}>
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
          label="Project"
          name="projectId"
          rules={[
            {
              required: true,
              message: "Choose a project to remove!",
            },
          ]}
        >
          <Select
            options={projectList}
            size="large"
            onChange={() => setOnChangeForm(true)}
          />
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
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={onClose}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel remove a project. All infomation will be
          removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export default RemoveProject;
