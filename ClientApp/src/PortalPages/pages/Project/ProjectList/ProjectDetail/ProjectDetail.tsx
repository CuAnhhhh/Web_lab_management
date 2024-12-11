import { notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { getProjectDetail } from "src/PortalPages/api/ProjectApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Project } from "src/PortalPages/model/ProjectModel";
import { Student } from "src/PortalPages/model/StudentModel";

const ProjectDetail = () => {
  const urlQuery = new URLSearchParams(location.search);
  const projectId = urlQuery.get("projectId") ?? "";
  const [projectDetail, setProjectDetail] =
    useState<Project.ProjectDetailModel>();
  const uploadRef = useRef<FileUploadPropsRef>(null);

  useEffect(() => {
    if (projectId) {
      getProjectDetailFucntion();
      uploadRef?.current?.setServiceId(projectId);
    }
  }, [projectId]);

  const getProjectDetailFucntion = async () => {
    try {
      const result = await getProjectDetail(projectId);
      if (result?.isDone) {
        setProjectDetail(result?.projectDetail);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const columns: TableProps<Student.RelationshipStudentModel>["columns"] = [
    {
      title: "Student name",
      key: "name",
      render: (_, record) => <div>{record?.studentId}</div>,
    },
    {
      title: "Role",
      key: "role",
      render: (_, record) => (
        <div>{record?.isLeader ? "Leader" : "Member"}</div>
      ),
    },
    {
      title: "Added By",
      key: "createdBy",
      render: (_, record) => <div>{record?.createdBy}</div>,
    },
    {
      title: "Added Date",
      key: "createdDate",
      render: (_, record) => (
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY")}</div>
      ),
    },
  ];

  const onRenderInformation = () => (
    <>
      <div style={{ display: "flex" }}>
        <CustomText label="Project Name">
          {projectDetail?.projectName}
        </CustomText>
        <CustomText label="Description">
          {projectDetail?.description}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Project type">
          {projectDetail?.projectTypeId}
        </CustomText>
        <CustomText label="Collaboration">
          {projectDetail?.collaboration ? "Group" : "Single"}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Total member">
          {projectDetail?.totalMember}
        </CustomText>
        <CustomText label="In prpgress">
          {projectDetail?.isActive ? "Yes" : "No"}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Created by">{projectDetail?.createdBy}</CustomText>
        <CustomText label="Created date">
          {dayjs(projectDetail?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </div>
      {!projectDetail?.isActive && (
        <div style={{ display: "flex" }}>
          <CustomText label="Removed by">{projectDetail?.removedBy}</CustomText>
          <CustomText label="Removed date">
            {dayjs(projectDetail?.removedDate).format("DD/MMM/YYYY")}
          </CustomText>
        </div>
      )}
    </>
  );

  const onRenderMember = () => (
    <Table
      columns={columns}
      dataSource={projectDetail?.relationshipList}
      className="borderTable"
      rowKey={(record) => record.relationshipId ?? ""}
      pagination={false}
    />
  );

  const onRenderDocument = () => (
    <FileUpload serviceType="projects" ref={uploadRef} viewOnly />
  );

  return (
    <div className="detailPadding">
      <CustomCard label="Information">{onRenderInformation()}</CustomCard>
      <CustomCard label="Member">{onRenderMember()}</CustomCard>
      <CustomCard label="Document">{onRenderDocument()}</CustomCard>
    </div>
  );
};

export default ProjectDetail;
