import { Empty, notification, Progress } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getReportDetail } from "src/PortalPages/api/ReportApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import { Reports } from "src/PortalPages/model/ReportModel";
import ReportCard from "./Components/ReportCard";

const ReportDetail = () => {
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const [reportList, setReportList] = useState<Reports.ReportListModel[]>();
  const [reload, setReload] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [exsist, setExsist] = useState(false);
  const [reportWeeks, setReportWeeks] = useState<number[]>();
  const [isLeader, setIsLeader] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");

  const trigger = () => setReload(!reload);

  useEffect(() => {
    if (studentId) {
      getReportDetailFucntion();
    }
  }, [studentId, reload]);

  const getReportDetailFucntion = async () => {
    try {
      const result = await getReportDetail({
        studentId: studentId,
        currentId: userData?.studentId,
      });
      setExsist(result?.isDone ?? false);
      if (result?.isDone) {
        setReportList(result?.reportList);
        setCurrentWeek(dayjs().diff(result?.projectCreatedDate, "week"));
        setReportWeeks(
          result?.reportList?.map((item) => item?.reportedWeek ?? -1)
        );
        setIsLeader(result?.isLeader ?? false);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const progressStep = () => {
    const colors = [...Array(currentWeek + 1).keys()].map((item) => {
      if (reportWeeks?.includes(item)) return "#52c41a";
      if (item == currentWeek) return "#ffe58f";
      return "#ff4d4f";
    });
    return colors;
  };

  const onRenderReportOverral = () => (
    <CustomCard label="Report overral">
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

  const onRenderExsist = () => (
    <>
      {onRenderReportOverral()}
      {[...Array(currentWeek + 1).keys()].map((i) => {
        if (reportWeeks?.includes(i)) {
          return (
            <ReportCard
              key={i}
              reportDetail={reportList?.[reportWeeks?.indexOf(i)]}
              reportedWeek={i}
              isCurrent={i == currentWeek}
              isLeader={isLeader}
              studentId={studentId}
              trigger={trigger}
            />
          );
        }
        return (
          <ReportCard
            key={i}
            reportedWeek={i}
            isCurrent={i == currentWeek}
            isLeader={isLeader}
            studentId={studentId}
            trigger={trigger}
          />
        );
      })}
    </>
  );

  return (
    <div className="detailPadding">
      {exsist ? (
        onRenderExsist()
      ) : (
        <div style={{ fontWeight: 700, textAlign: "center" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          Dont exsist current student report in this project
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
