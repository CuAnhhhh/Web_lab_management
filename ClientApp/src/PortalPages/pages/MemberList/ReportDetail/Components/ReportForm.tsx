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
import CustomText from "src/PortalPages/component/CustomText/CustomText";

interface IReportForm {
  studentId: string;
  reportedWeek: number;
  trigger: () => void;
  reportDetail?: Reports.ReportListModel;
  isLeader?: boolean;
}

const ReportForm = (props: IReportForm) => {
  const {
    studentId,
    reportedWeek,
    trigger,
    reportDetail,
    isLeader,
  } = props;
  const [form] = Form.useForm();
  const uploadRef = useRef<FileUploadPropsRef>(null);

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
      studentId: studentId,
      studentReport: form.getFieldValue("report"),
      comment: form.getFieldValue("comment"),
      reportedDate: isLeader ? undefined : dayjs().format(),
      reportedWeek: reportedWeek,
    };

    try {
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
        uploadRef?.current?.resetUpload();
        trigger();
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const onAddReport = () => (
    <>
      <CustomText label="Comment">{reportDetail?.comment ?? "N/A"}</CustomText>
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
    </>
  );

  const onAddComment = () => (
    <>
      <Form.Item
        label="Comment"
        name="comment"
        rules={[
          {
            required: true,
            message: "Input a comment!",
          },
        ]}
      >
        <Input.TextArea rows={7} style={{ resize: "none" }} />
      </Form.Item>
      <CustomText label="Student report">
        {reportDetail?.studentReport ?? "N/A"}
      </CustomText>
      <CustomText label="Student report date">
        {reportDetail?.reportedDate
          ? dayjs(reportDetail?.reportedDate).format("DD/MMM/YYYY HH:mm")
          : "N/A"}
      </CustomText>
    </>
  );

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        className={style.formLayout}
      >
        {isLeader ? onAddComment() : onAddReport()}
        <Form.Item label="Documents">
          <FileUpload
            serviceType="reports"
            ref={uploadRef}
            viewOnly={isLeader}
          />
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
