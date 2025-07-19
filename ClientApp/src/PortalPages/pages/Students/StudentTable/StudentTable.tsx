import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteStudent, getStudentList } from "src/PortalPages/api/StudentApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Student } from "src/PortalPages/model/StudentModel";

interface IStudentTable {
  tab: string;
  currentTab?: string;
  filter?: string;
}

const StudentTable = ({ tab, currentTab, filter }: IStudentTable) => {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState<Student.StudentListModel[]>();
  const [studentSelect, setStudentSelect] =
    useState<Student.StudentListModel>();
  const [openModal, setOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const { openLoading, closeLoading } = useLoading();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  useEffect(() => {
    if (tab === currentTab) getStudentListFucntion();
  }, [currentTab, reload, currentPage, filter]);

  const getStudentListFucntion = async () => {
    try {
      openLoading();
      const result = await getStudentList({
        status: tab,
        currentPage: currentPage,
        studentRole: filter,
      });
      if (result?.isDone) {
        setStudentList(result?.studentList);
        setTotalRecord(result?.total ?? 0);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const deleteStudentFunction = async () => {
    const model: Student.DeleteStudentModel = {
      studentId: studentSelect?.studentId,
      removedBy: userData?.studentId,
      removedDate: dayjs().format(),
    };

    try {
      openLoading();
      const result = await deleteStudent(model);
      if (result?.isDone) {
        notification.open({
          message: "Remove student successed",
          type: "success",
        });
        setReload(!reload);
        setOpenModal(false);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const columns: TableProps<Student.StudentListModel>["columns"] = [
    {
      title: "Student name",
      key: "name",
      render: (_, record) => (
        <Button
          type="text"
          onClick={() =>
            navigate(`/student/student-detail/?studentId=${record.studentId}`)
          }
        >
          {record?.studentName}
        </Button>
      ),
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
  ];

  const columnsIn: TableProps<Student.StudentListModel>["columns"] = [
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => <div>{record?.createdBy ?? "Admin"}</div>,
    },
    {
      title: "Days in lab",
      key: "daysInLab",
      render: (_, record) => (
        <div>{dayjs().diff(dayjs(record?.createdDate), "day")}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
          <CustomTooltip content="Edit">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() =>
                navigate(`/student/edit-student/?studentId=${record.studentId}`)
              }
            />
          </CustomTooltip>
          <CustomTooltip content="Delete">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              onClick={() => {
                setStudentSelect(record);
                setOpenModal(true);
              }}
            />
          </CustomTooltip>
        </div>
      ),
    },
  ];

  const columnsOut: TableProps<Student.StudentListModel>["columns"] = [
    {
      title: "Removed By",
      key: "removedBy",
      render: (_, record) => <div>{record?.removedBy ?? "Admin"}</div>,
    },
    {
      title: "Removed Date",
      key: "removedDate",
      render: (_, record) => (
        <div>{dayjs(record?.removedDate).format("DD/MMM/YYYY HH:mm")}</div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={
          tab == "open" ? columns.concat(columnsIn) : columns.concat(columnsOut)
        }
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
      <CustomModal
        title="Confirm delete student"
        open={openModal}
        onOk={() => deleteStudentFunction()}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to remove the below student, it will be permanently
          removed. And if this student are in project, it will be removed from
          project member list
        </div>
        <CustomText label="Student name">
          {studentSelect?.studentName}
        </CustomText>
        <CustomText label="Created by">
          {studentSelect?.createdBy ?? "Admin"}
        </CustomText>
        <CustomText label="Created at">
          {dayjs(studentSelect?.createdDate).format("DD/MMM/YYYY HH:mm")}
        </CustomText>
      </CustomModal>
    </>
  );
};

export default StudentTable;
