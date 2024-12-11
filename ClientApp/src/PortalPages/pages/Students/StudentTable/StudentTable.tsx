import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteStudent, getStudentList } from "src/PortalPages/api/StudentApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Student } from "src/PortalPages/model/StudentModel";

interface IStudentTable {
  tab?: string;
  currentTab?: string;
}

const StudentTable = ({ tab, currentTab }: IStudentTable) => {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState<Student.StudentListModel[]>();
  const [studentSelect, setStudentSelect] =
    useState<Student.StudentListModel>();
  const [openModal, setOpenModal] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (tab === currentTab) getStudentListFucntion();
  }, [currentTab, reload]);

  const getStudentListFucntion = async () => {
    try {
      const result = await getStudentList(tab ?? "");
      if (result?.isDone) {
        setStudentList(result?.studentList);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const deleteStudentFunction = async () => {
    try {
      const result = await deleteStudent(studentSelect?.studentId ?? "");
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
      title: "Created Date",
      key: "createdBy",
      render: (_, record) => (
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY")}</div>
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
                navigate(
                  `/student/edit-student/?studentId=${record.studentId}`
                )
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
      render: (_, record) => <div>{record?.removedBy}</div>,
    },
    {
      title: "Removed Date",
      key: "removedDate",
      render: (_, record) => (
        <div>{dayjs(record?.removedDate).format("DD/MMM/YYYY")}</div>
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
      />
      <CustomModal
        title="Confirm delete student"
        open={openModal}
        onOk={() => deleteStudentFunction()}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to remove the below student, it will be permanently
          removed
        </div>
        <CustomText label="Student name">
          {studentSelect?.studentName}
        </CustomText>
        <CustomText label="Created by">
          {studentSelect?.createdBy ?? "Admin"}
        </CustomText>
        <CustomText label="Created at">
          {dayjs(studentSelect?.createdDate).format("DD/MMM/YYYY")}
        </CustomText>
      </CustomModal>
    </>
  );
};

export default StudentTable;
