import { Button, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { createReport } from "src/PortalPages/api/ReportApi";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Reports } from "src/PortalPages/model/ReportModel";
import style from "./Report.module.scss";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";

interface IReportForm {
  reportedWeek: number;
  trigger: () => void;
  reportDetail?: Reports.MemberReportModel;
  setOnChangeForm: (state: boolean) => void;
}

const ReportForm = (props: IReportForm) => {
  const { reportedWeek, trigger, reportDetail, setOnChangeForm } = props;
  const [form] = Form.useForm();
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const { openLoading, closeLoading } = useLoading();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  useEffect(() => {
    if (reportDetail?.reportId) {
      uploadRef?.current?.setServiceId(reportDetail?.reportId);
      form.setFieldValue("comment", reportDetail?.comment);
      form.setFieldValue("report", reportDetail?.studentReport);
    }
  }, [reportDetail]);

  const submitForm = async () => {
    const model: Reports.ReportListModel = {
      reportId: reportDetail?.reportId,
      studentId: userData?.studentId,
      studentReport: form.getFieldValue("report"),
      reportedDate: dayjs().format(),
      reportedWeek: reportedWeek,
      isProjectReport: true,
    };

    try {
      openLoading();
      const result = await createReport(model);
      if (result?.isDone) {
        if (!reportDetail?.reportId) {
          await uploadRef?.current?.uploadFuntion(result?.id ?? "");
        }
        notification.open({
          message: `${
            reportDetail?.reportId ? "Update" : "Create"
          } report successed`,
          type: "success",
        });
        form.resetFields();
        setOnChangeForm(false);
        uploadRef?.current?.resetUpload();
        trigger();
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
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        className={style.formLayout}
        onChange={() => setOnChangeForm(true)}
      >
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
      <div className={style.submitButton}>
        <Button onClick={form.submit} type="primary" className="commonButton">
          Submit
        </Button>
      </div>
    </>
  );
};

export default ReportForm;
