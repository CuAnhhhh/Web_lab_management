import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FallOutlined,
  PauseCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Empty, notification } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getStudentDetail } from "src/PortalPages/api/StudentApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
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
  { label: "Master", value: 107 },
  { label: "Engineer", value: 108 },
  { label: "Ph.D.", value: 109 },
  { label: "Out Lab", value: 110 },
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
  Promote = 106,
  Demote = 107,
}

const StudentDetail = () => {
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const [studentDetail, setStudentDetail] =
    useState<Student.StudentDetailModel>();
  const [timelineItems, setTimelineItems] = useState<ICustomTimeline[]>();
  const { openLoading, closeLoading } = useLoading();

  useEffect(() => {
    if (studentId) {
      getStudentDetailFucntion();
    }
  }, [studentId]);

  const getStudentDetailFucntion = async () => {
    try {
      openLoading();
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
    closeLoading();
  };

  const getRoleName = (colab?: boolean, leader?: boolean) => {
    if (!colab) {
      return "Participant";
    }
    if (leader) return "Leader";
    return "Member";
  };

  const getListTimeline = (history?: Student.ProjectHistoryModel) => {
    let item: ICustomTimeline = {};
    switch (history?.status) {
      case StatusEnum.InProgress:
        item = {
          id: history?.relationshipId,
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
          title: "Student are working on the project.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              {dayjs().diff(history?.projectCreatedDate, "week") > 15 && (
                <CustomText label="Suggested point">
                  {(history?.reportCount ?? 0) / 1.6}
                </CustomText>
              )}
            </>
          ),
        };
        break;
      case StatusEnum.EndProject:
        item = {
          id: history?.relationshipId,
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
          title: "Student have joined the closed project.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Closed By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Closed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Removed:
        item = {
          id: history?.relationshipId,
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
          title: "Student have been removed from the project.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Removed By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Removed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Completed:
        item = {
          id: history?.relationshipId,
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
          title: "Student have finished the project.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Finished By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Finished Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.OutLab:
        item = {
          id: history?.relationshipId,
          icon: (
            <ExclamationCircleOutlined
              style={{
                fontSize: 20,
                backgroundColor: "#eb2f96",
                borderRadius: "50%",
                color: "#fff",
              }}
            />
          ),
          title:
            "Student have been removed from lab and all progresses are stopped.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Removed By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Removed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Demote:
        item = {
          id: history?.relationshipId,
          icon: (
            <FallOutlined
              style={{
                fontSize: 16,
                backgroundColor: "#eb2f96",
                borderRadius: "50%",
                color: "#fff",
                height: 18,
                width: 18,
              }}
            />
          ),
          title: "Student have been demoted from leader to member.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Closed By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Closed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
            </>
          ),
        };
        break;
      case StatusEnum.Promote:
        item = {
          id: history?.relationshipId,
          icon: (
            <RiseOutlined
              style={{
                fontSize: 16,
                backgroundColor: "#52c41a",
                borderRadius: "50%",
                color: "#fff",
                height: 20,
                width: 20,
              }}
            />
          ),
          title: "Student have been promoted from member to leader.",
          content: (
            <>
              <CustomText
                label="Project Name"
                onClick={() =>
                  window.open(
                    `/project/project-detail/?projectId=${history?.projectId}`,
                    "_blank"
                  )
                }
                customStyle={{ color: "#0E7D8F", cursor: "pointer" }}
              >
                {history?.projectName}
              </CustomText>
              <CustomText label="Added By">
                {history?.createdBy ?? "Admin"}
              </CustomText>
              <CustomText label="Added Date">
                {dayjs(history?.createdDate).format("DD/MMM/YYYY HH:mm")}
              </CustomText>
              <CustomText label="Role">
                {getRoleName(history?.collaboration, history?.isLeader)}
              </CustomText>
              <CustomText label="Closed By">
                {history?.removedBy ?? "Admin"}
              </CustomText>
              <CustomText label="Closed Date">
                {dayjs(history?.removedDate).format("DD/MMM/YYYY HH:mm")}
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
          {nationality.find((item) => item.value == studentDetail?.nationality)
            ?.label || "N/A"}
        </CustomText>
        <CustomText label="Address">
          {studentDetail?.address || "N/A"}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Gender">
          {studentDetail?.gender ? "Female" : "Male"}
        </CustomText>
        <CustomText label="Student Role">
          {studentDetail?.studentRole || "N/A"}
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
          {dayjs(studentDetail?.createdDate).format("DD/MMM/YYYY HH:mm")}
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
          key={item.id}
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
