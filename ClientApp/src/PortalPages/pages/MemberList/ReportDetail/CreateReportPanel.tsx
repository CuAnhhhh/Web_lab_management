import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, notification, Select } from "antd";
import dayjs from "dayjs";
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from "react";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import style from "./CreateReportPanel.module.scss";
import { Reports } from "src/PortalPages/model/ReportModel";
import { createReport } from "src/PortalPages/api/ReportApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

export interface IReportFormPanelRef {
  openPanel: () => void;
}

interface IReportFormPanel {
  trigger?: () => void;
  reportedWeeks?: number[];
  currentWeek: number;
}

const Component = (props: IReportFormPanel, ref: Ref<IReportFormPanelRef>) => {
  const { trigger, reportedWeeks, currentWeek } = props;
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const [form] = Form.useForm();
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const { openLoading, closeLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const listWeeks = [
    ...Array(currentWeek + 1 > 16 ? 16 : currentWeek + 1).keys(),
  ]
    .filter((item) => !reportedWeeks?.includes(item))
    .map((item) => ({ label: `Week ${item + 1}`, value: item }));

  useImperativeHandle(ref, () => ({
    openPanel,
  }));

  const openPanel = () => {
    setOpen(true);
  };

  const closePanel = () => {
    setOnChangeForm(false);
    setOpenModal(false);
    form.resetFields();
    uploadRef?.current?.resetUpload();
    setOpen(false);
  };

  const submitForm = async () => {
    const model: Reports.ReportListModel = {
      studentId: studentId,
      studentReport: form.getFieldValue("report"),
      comment: form.getFieldValue("comment"),
      reportedDate: userData?.isLeader ? undefined : dayjs().format(),
      reportedWeek: form.getFieldValue("reportedWeek"),
      isProjectReport: false,
    };

    try {
      openLoading();
      const result = await createReport(model);
      if (result?.isDone) {
        if (result?.id) {
          await uploadRef?.current?.uploadFuntion(result?.id);
        }
        notification.open({
          message: "Create report successed",
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
    closeLoading();
  };

  return (
    <Drawer
      title={"Create a report"}
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
          label="Reported Week"
          name="reportedWeek"
          rules={[
            {
              required: true,
              message: "Please select a week to create report!",
            },
          ]}
        >
          <Select
            options={listWeeks}
            placeholder="Select a week"
            size="large"
            onChange={() => setOnChangeForm(true)}
          />
        </Form.Item>
        <Form.Item
          label="Student report"
          name="report"
          rules={[
            {
              required: true,
              message: "Input a report!",
            },
          ]}
        >
          <Input.TextArea rows={7} style={{ resize: "none" }} />
        </Form.Item>
        <Form.Item label="Documents">
          <FileUpload serviceType="reports" ref={uploadRef} />
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
          Do you want to cancel create project report. All infomation will be
          removed!
        </div>
      </CustomModal>
    </Drawer>
  );
};

export const ReportFormPanel = forwardRef(Component);
