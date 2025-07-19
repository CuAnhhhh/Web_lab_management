import {
  CloseOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FormOutlined,
} from "@ant-design/icons";
import { Button, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Reports } from "src/PortalPages/model/ReportModel";
import ReportForm from "./ReportForm";

interface IReportCard {
  reportDetail?: Reports.MemberReportModel;
  reportedWeek: number;
  trigger: () => void;
  isMultiProject?: boolean;
}

const ReportCard = ({
  reportDetail,
  reportedWeek,
  trigger,
  isMultiProject,
}: IReportCard) => {
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const [edit, setEdit] = useState(false);
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  useEffect(() => {
    if (reportDetail?.reportId) {
      uploadRef?.current?.setServiceId(reportDetail?.reportId);
    }
  }, [reportDetail, edit]);

  const columns: TableProps<Reports.MemberReportModel>["columns"] = [
    {
      title: "Student name",
      key: "name",
      render: (_, record) => <div>{record?.studentName}</div>,
    },
    {
      title: "Reported Date",
      key: "reportedDate",
      render: (_, record) => (
        <div>{dayjs(record?.reportedDate).format("DD/MMM/YYYY HH:mm")}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <CustomTooltip content="Report detail">
          <Button
            icon={<FormOutlined />}
            type="text"
            onClick={() =>
              window.open(
                `/member/report-detail/?studentId=${record.studentId}`,
                "_blank"
              )
            }
          />
        </CustomTooltip>
      ),
    },
  ];

  const onRenderMember = () => (
    <Table
      columns={columns}
      dataSource={reportDetail?.memberReportList}
      className="borderTable"
      rowKey={(record) => record.reportId ?? ""}
      scroll={{ x: "max-content" }}
      pagination={false}
    />
  );

  const onRenderExtra = () => (
    <CustomTooltip content={edit ? "Cancel" : "Edit"}>
      <Button
        icon={edit ? <CloseOutlined /> : <EditOutlined />}
        type="text"
        style={{ marginRight: 8 }}
        onClick={(e) => {
          e.stopPropagation();
          onChangeForm ? setOpenModal(true) : setEdit(!edit);
        }}
      />
    </CustomTooltip>
  );

  const onFormReport = () => (
    <ReportForm
      reportedWeek={reportedWeek}
      trigger={() => {
        trigger();
        setEdit(false);
      }}
      reportDetail={reportDetail}
      setOnChangeForm={setOnChangeForm}
    />
  );

  const onViewReport = () => (
    <>
      <CustomText label="Project report">
        {reportDetail?.studentReport ?? "N/A"}
      </CustomText>
      <CustomText label="Reporter">
        {reportDetail?.studentName ?? "N/A"}
      </CustomText>
      <CustomText label="Report date">
        {reportDetail?.reportedDate
          ? dayjs(reportDetail?.reportedDate).format("DD/MMM/YYYY HH:mm")
          : "N/A"}
      </CustomText>
      <div style={{ fontWeight: 600, padding: 8 }}>Report document</div>
      <FileUpload serviceType="reports" ref={uploadRef} viewOnly />
      {reportDetail?.reportId && isMultiProject && onRenderMember()}
    </>
  );

  return (
    <CustomCard
      label={`Week ${reportedWeek + 1}`}
      extra={userData?.studentId == "0" ? undefined : onRenderExtra()}
    >
      {edit ? onFormReport() : onViewReport()}
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={() => {
          setEdit(!edit);
          setOpenModal(false);
          setOnChangeForm(false);
        }}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel create report. All infomation will be removed!
        </div>
      </CustomModal>
    </CustomCard>
  );
};

export default ReportCard;
