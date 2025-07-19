import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Empty, notification, Progress, Result } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMemberReportDetail } from "src/PortalPages/api/ReportApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { Reports } from "src/PortalPages/model/ReportModel";
import ReportCard from "../Components/ReportCard";
import { IReportFormPanelRef, ReportFormPanel } from "./CreateReportPanel";

const ReportDetail = () => {
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const navigate = useNavigate();
  const [reportList, setReportList] = useState<Reports.MemberReportModel[]>();
  const [reload, setReload] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [exsist, setExsist] = useState(true);
  const [reportWeeks, setReportWeeks] = useState<number[]>();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const { openLoading, closeLoading } = useLoading();
  const [isWeekly, setIsWeekly] = useState<boolean>();
  const ReportFormPanelRef = useRef<IReportFormPanelRef>(null);

  const trigger = () => setReload(!reload);

  useEffect(() => {
    if (studentId != userData?.studentId && !userData?.isLeader) {
      setExsist(false);
      return;
    }
    if (studentId) {
      getReportDetailFucntion();
    }
  }, [studentId, reload]);

  const getReportDetailFucntion = async () => {
    try {
      openLoading();
      const result = await getMemberReportDetail(studentId);
      setExsist(result?.isDone ?? false);
      if (result?.isDone) {
        setReportList(
          result?.reportList?.sort(
            (a, b) => (a?.reportedWeek ?? 0) - (b?.reportedWeek ?? 0)
          )
        );
        const w = dayjs().diff(result?.projectCreatedDate, "week");
        setCurrentWeek(w > 15 ? 16 : w);
        setReportWeeks(
          result?.reportList?.map((item) => item?.reportedWeek ?? -1)
        );
        setIsWeekly(result?.isWeeklyReport);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const progressStep = () => {
    const colors = [
      ...Array(currentWeek + 1 > 16 ? 16 : currentWeek + 1).keys(),
    ].map((item) => {
      if (reportWeeks?.includes(item)) return "#52c41a";
      if (item == currentWeek) return "#ffe58f";
      return "#ff4d4f";
    });
    return colors;
  };

  const onRenderReportOverral = () => (
    <CustomCard label="Report overall">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Progress
          percent={(currentWeek + 1) * 6.25}
          size={[40, 10]}
          steps={{ count: 16, gap: 8 }}
          showInfo={false}
          strokeColor={progressStep()}
        />
      </div>
    </CustomCard>
  );

  const onRenderWeekly = () => (
    <>
      {onRenderReportOverral()}
      {[...Array(currentWeek + 1 > 16 ? 16 : currentWeek + 1).keys()].map(
        (i) => {
          if (reportWeeks?.includes(i)) {
            return (
              <ReportCard
                key={i}
                reportDetail={reportList?.[reportWeeks?.indexOf(i)]}
                reportedWeek={i}
                trigger={trigger}
              />
            );
          }
          return <ReportCard key={i} reportedWeek={i} trigger={trigger} />;
        }
      )}
    </>
  );

  const onRenderNotWeekly = () => (
    <div style={{ paddingTop: 16 }}>
      {userData?.studentId == studentId && (
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          type="text"
          onClick={() => {
            ReportFormPanelRef?.current?.openPanel();
          }}
        >
          Create a report
        </Button>
      )}
      {reportList?.map((item) => (
        <ReportCard
          key={item?.reportId}
          reportDetail={item}
          reportedWeek={item?.reportedWeek ?? -1}
          trigger={trigger}
        />
      ))}
      {!reportList?.length && (
        <div style={{ fontWeight: 700, textAlign: "center" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          There is no report have been created.
        </div>
      )}
    </div>
  );

  const onRenderReportDetail = () =>
    isWeekly ? onRenderWeekly() : onRenderNotWeekly();

  return (
    <div className="detailPadding">
      {exsist ? (
        onRenderReportDetail()
      ) : (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you dont have permission to access this page."
          extra={
            <Button
              className="commonButton"
              type="primary"
              onClick={() => navigate("/overview")}
            >
              Back Home
            </Button>
          }
        />
      )}
      <ReportFormPanel
        ref={ReportFormPanelRef}
        trigger={trigger}
        reportedWeeks={reportWeeks}
        currentWeek={currentWeek}
      />
    </div>
  );
};

export default ReportDetail;
