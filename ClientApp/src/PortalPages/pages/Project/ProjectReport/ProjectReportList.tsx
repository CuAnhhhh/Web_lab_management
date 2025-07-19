import { FormOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReportList } from "src/PortalPages/api/ReportApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Student } from "src/PortalPages/model/StudentModel";

const ProjectReportList = () => {
  const navigate = useNavigate();
  const { openLoading, closeLoading } = useLoading();
  const [studentList, setStudentList] =
    useState<Student.StudentReportModel[]>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  useEffect(() => {
    getReportListFucntion();
  }, [currentPage]);

  const getReportListFucntion = async () => {
    try {
      openLoading();
      const result = await getReportList(currentPage);
      if (result?.isDone) {
        setStudentList(result?.studentList);
        setTotalRecord(result?.total ?? 0);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  const columns: TableProps<Student.StudentReportModel>["columns"] = [
    {
      title: "Student name",
      key: "name",
      render: (_, record) => (
        <CustomTooltip content={record?.studentName} maxWidth={200} />
      ),
    },
    {
      title: "Hust ID",
      key: "hustID",
      render: (_, record) => <div>{record?.hustId}</div>,
    },
    {
      title: "Phone Number",
      key: "phonenumber",
      render: (_, record) => <div>{record?.phoneNumber}</div>,
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => <div>{record?.email}</div>,
    },
    {
      title: "Project Name",
      key: "projectName",
      render: (_, record) => (
        <CustomTooltip content={record?.projectName} maxWidth={200} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div
          style={{
            display:
              record?.studentId == userData?.studentId ||
              userData?.studentId == "0"
                ? undefined
                : "none",
          }}
        >
          <CustomTooltip content="Edit report">
            <Button
              icon={<FormOutlined />}
              type="text"
              onClick={() =>
                navigate(
                  `/project/project-report-detail/?projectId=${record?.projectId}`
                )
              }
            />
          </CustomTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="tablePadding">
      <Table
        columns={columns}
        dataSource={studentList}
        className="borderTable"
        rowKey={(record) => record.studentId ?? ""}
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: totalRecord,
          simple: true,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default ProjectReportList;
