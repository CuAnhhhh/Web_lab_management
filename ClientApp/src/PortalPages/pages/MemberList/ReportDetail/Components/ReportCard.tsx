import {
  CloseOutlined,
  EditOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Button, Rate } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Reports } from "src/PortalPages/model/ReportModel";
import ReportForm from "./ReportForm";

interface IReportCard {
  reportDetail?: Reports.ReportListModel;
  reportedWeek: number;
  isCurrent?: boolean;
  isLeader?: boolean;
  studentId: string;
  trigger: () => void;
}

const ReportCard = ({
  reportDetail,
  reportedWeek,
  isCurrent,
  isLeader,
  studentId,
  trigger,
}: IReportCard) => {
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (reportDetail?.reportId) {
      uploadRef?.current?.setServiceId(reportDetail?.reportId);
    }
  }, [reportDetail, edit]);

  const customIcons: Record<number, React.ReactNode> = {
    1: (
      <FrownOutlined
        style={{
          color: reportDetail?.studentScore === 1 ? "#ff4d4f" : "#0000000f",
        }}
      />
    ),
    2: (
      <MehOutlined
        style={{
          color: reportDetail?.studentScore === 2 ? "#ffe58f" : "#0000000f",
        }}
      />
    ),
    3: (
      <SmileOutlined
        style={{
          color: reportDetail?.studentScore === 3 ? "#52c41a" : "#0000000f",
        }}
      />
    ),
  };

  const onRenderExtra = () => (
    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex" }}>
      <Rate
        style={{ padding: 6 }}
        disabled
        character={({ index = 0 }) => customIcons[index + 1]}
      />
      {isCurrent && (
        <CustomTooltip content={edit ? "Cancel" : "Edit"}>
          <Button
            icon={edit ? <CloseOutlined /> : <EditOutlined />}
            type="text"
            style={{ marginRight: 8 }}
            onClick={() => {
              setEdit(!edit);
            }}
          />
        </CustomTooltip>
      )}
    </div>
  );

  const onFormReport = () => (
    <ReportForm
      studentId={studentId}
      reportedWeek={reportedWeek}
      trigger={() => {
        trigger();
        setEdit(false);
      }}
      reportDetail={reportDetail}
      isLeader={isLeader}
    />
  );

  const onViewReport = () => (
    <>
      <CustomText label="Comment">{reportDetail?.comment ?? "N/A"}</CustomText>
      <CustomText label="Student report">
        {reportDetail?.studentReport ?? "N/A"}
      </CustomText>
      <CustomText label="Student report date">
        {reportDetail?.reportedDate
          ? dayjs(reportDetail?.reportedDate).format("DD/MMM/YYYY HH:mm")
          : "N/A"}
      </CustomText>
      <div style={{ fontWeight: 600, padding: 8 }}>Report document</div>
      <FileUpload serviceType="reports" ref={uploadRef} viewOnly />
    </>
  );

  return (
    <CustomCard label={`Week ${reportedWeek + 1}`} extra={onRenderExtra()}>
      {edit ? onFormReport() : onViewReport()}
    </CustomCard>
  );
};

export default ReportCard;
