import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { Empty, notification } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getStudentDetail } from "src/PortalPages/api/StudentApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTimeline, {
  ICustomTimeline,
} from "src/PortalPages/component/CustomTimeline/CustomTimeline";
import { Student } from "src/PortalPages/model/StudentModel";

const studentStatus: { label: string; value: number }[] = [
  { label: "First year", value: 101 },
  { label: "Second year", value: 102 },
  { label: "Third year", value: 103 },
  { label: "Fourth year", value: 104 },
  { label: "Fifth year", value: 105 },
  { label: "Sixth year", value: 106 },
];

const nationality: { label: string; value: number }[] = [
  { label: "Vietnam", value: 101 },
  { label: "Laos", value: 102 },
  { label: "Cambodia", value: 103 },
];

const enum StatusEnum {
  InProgress = 101,
  EndProject = 102,
  Removed = 103,
  Completed = 104,
  OutLab = 105,
}

const StudentDetail = () => {
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const [studentDetail, setStudentDetail] =
    useState<Student.StudentDetailModel>();
  const [timelineItems, setTimelineItems] = useState<ICustomTimeline[]>();

  useEffect(() => {
    if (studentId) {
      getStudentDetailFucntion();
    }
  }, [studentId]);

  const getStudentDetailFucntion = async () => {
    try {
      const result = await getStudentDetail(studentId);
      if (result?.isDone) {
        setStudentDetail(result?.studentDetail);
        const items = result?.studentDetail?.projectHistory?.map((item) =>
          getListTimeline(item)
        );
        setTimelineItems(items);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const getListTimeline = (history?: Student.ProjectHistoryModel) => {
    let item: ICustomTimeline = {};
    switch (history?.status) {
      case StatusEnum.InProgress:
        item = {
          icon: (
            <ClockCircleOutlined
              style={{
                fontSize: 20,
                backgroundColor: "#1877F2",
                borderRadius: "50%",
                color: "#fff",
              }}
            />
          ),
          title: "Student are working on the project",
          content: (
            <>
              <CustomText label="Project Name">
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">{history?.createdBy}</CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY")}
              </CustomText>
              <CustomText label="Role">
                {history?.isLeader ? "Leader" : "Member"}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.EndProject:
        item = {
          icon: (
            <CloseCircleOutlined
              style={{
                fontSize: 20,
                backgroundColor: "#eb2f96",
                borderRadius: "50%",
                color: "#fff",
              }}
            />
          ),
          title: "Student have joined the closed project",
          content: (
            <>
              <CustomText label="Project Name">
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">{history?.createdBy}</CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY")}
              </CustomText>
              <CustomText label="Role">
                {history?.isLeader ? "Leader" : "Member"}
              </CustomText>
              <CustomText label="Closed By">{history?.removedBy}</CustomText>
              <CustomText label="Closed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Removed:
        item = {
          icon: (
            <PauseCircleOutlined
              style={{
                fontSize: 20,
                backgroundColor: "#eb2f96",
                borderRadius: "50%",
                color: "#fff",
              }}
            />
          ),
          title: "Student have been removed from the project",
          content: (
            <>
              <CustomText label="Project Name">
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">{history?.createdBy}</CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY")}
              </CustomText>
              <CustomText label="Role">
                {history?.isLeader ? "Leader" : "Member"}
              </CustomText>
              <CustomText label="Removed By">{history?.removedBy}</CustomText>
              <CustomText label="Removed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Completed:
        item = {
          icon: (
            <CheckCircleOutlined
              style={{
                fontSize: 20,
                backgroundColor: "#52c41a",
                borderRadius: "50%",
                color: "#fff",
              }}
            />
          ),
          title: "Student have finished the project",
          content: (
            <>
              <CustomText label="Project Name">
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">{history?.createdBy}</CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY")}
              </CustomText>
              <CustomText label="Role">
                {history?.isLeader ? "Leader" : "Member"}
              </CustomText>
            </>
          ),
        };
        break;
      default:
        break;
    }
    return item;
  };

  const onRenderInformation = () => (
    <>
      <div style={{ display: "flex" }}>
        <CustomText label="Student Name">
          {studentDetail?.studentName}
        </CustomText>
        <CustomText label="Hust Id">{studentDetail?.hustId}</CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Email">{studentDetail?.email}</CustomText>
        <CustomText label="Phone Number">
          {studentDetail?.phoneNumber}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Nationality">
          {
            nationality.find((item) => item.value == studentDetail?.nationality)
              ?.label
          }
        </CustomText>
        <CustomText label="Address">{studentDetail?.address}</CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Gender">
          {studentDetail?.gender ? "Female" : "Male"}
        </CustomText>
        <CustomText label="Student Role">
          {studentDetail?.studentRole}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Student Status">
          {
            studentStatus.find((item) => item.value == studentDetail?.status)
              ?.label
          }
        </CustomText>
        <CustomText label="Created Date">
          {dayjs(studentDetail?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </div>
      <CustomText label="Created By">
        {studentDetail?.createdBy ?? "Admin"}
      </CustomText>
    </>
  );

  const onRenderProjectHistory = () => (
    <>
      {timelineItems?.map((item, index) => (
        <CustomTimeline
          key={index}
          icon={item.icon}
          content={item.content}
          title={item.title}
          lastItem={timelineItems?.length == index + 1}
        />
      ))}
      {!studentDetail?.projectHistory?.length && (
        <div style={{ fontWeight: 700, textAlign: "center" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
          Student have not joined any project
        </div>
      )}
    </>
  );

  return (
    <div className="detailPadding">
      <CustomCard label="Student Information">
        {onRenderInformation()}
      </CustomCard>
      <CustomCard label="Project History">
        {onRenderProjectHistory()}
      </CustomCard>
    </div>
  );
};

export default StudentDetail;
