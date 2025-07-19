import {
  DeleteOutlined,
  FormOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, notification, Select, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectListName } from "src/PortalPages/api/ProjectApi";
import {
  addStudent,
  getMemberList,
  getStudentIdList,
  removeStudent,
} from "src/PortalPages/api/StudentApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Student } from "src/PortalPages/model/StudentModel";

const MemberList = () => {
  const [form] = Form.useForm();
  const [studentList, setStudentList] =
    useState<Student.StudentReportModel[]>();
  const [studentSelect, setStudentSelect] =
    useState<Student.StudentReportModel>();
  const [reload, setReload] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [listStudents, setListStudents] =
    useState<{ label?: string; value: string }[]>();
  const [totalMember, setTotalMember] = useState<number>(0);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const navigate = useNavigate();
  const { openLoading, closeLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [filter, setFilter] = useState<string>();
  const [option, setOption] = useState<{ value?: string; label?: string }[]>();

  const trigger = () => {
    setCurrentPage(1);
    setReload(!reload);
  };

  useEffect(() => {
    getMemberListFucntion();
  }, [reload, currentPage, filter]);

  useEffect(() => {
    getProjectList();
  }, []);

  const getMemberListFucntion = async () => {
    try {
      openLoading();
      const result = await getMemberList({
        studentId: userData?.studentId,
        currentPage: currentPage,
        projectId: userData?.projectId,
        filter: filter,
      });
      if (result?.isDone) {
        setStudentList(result?.studentList);
        setTotalMember(result?.totalMember ? result?.totalMember - 1 : 0);
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

  const getProjectList = async () => {
    try {
      openLoading();
      const result = await getProjectListName(1);
      if (result?.isDone) {
        setOption(
          result?.projectList?.map((item) => ({
            label: item?.projectName,
            value: item?.projectId,
          }))
        );
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const getListStudents = async () => {
    try {
      openLoading();
      const result = await getStudentIdList();
      if (result?.isDone) {
        setListStudents(
          result?.studentList?.map((item) => ({
            label: item?.studentName,
            value: item?.studentId ?? "",
          }))
        );
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  const addStudentFunction = async () => {
    const student: Student.RelationshipStudentModel = {
      studentId: form.getFieldValue("student"),
      projectId: userData?.projectId,
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };
    try {
      openLoading();
      const result = await addStudent(student);
      if (result?.isDone) {
        notification.open({
          message: "Add student successed",
          type: "success",
        });
        setOpenAddModal(false);
        form.resetFields();
        trigger();
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  const removeStudentFunction = async () => {
    const student: Student.RelationshipStudentModel = {
      studentId: studentSelect?.studentId,
      projectId: userData?.projectId,
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };
    try {
      openLoading();
      const result = await removeStudent(student);
      if (result?.isDone) {
        notification.open({
          message: "Remove student successed",
          type: "success",
        });
        setOpenRemoveModal(false);
        trigger();
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
      render: (_, record) => <div>{record?.studentName}</div>,
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
      render: (_, record) => <div>{record?.projectName}</div>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div
          style={{
            display:
              (userData?.studentId === record?.studentId) ===
              (userData?.isLeader || userData?.studentRole == "0")
                ? "none"
                : "flex",
          }}
        >
          <CustomTooltip content="Edit report">
            <Button
              icon={<FormOutlined />}
              type="text"
              onClick={() =>
                navigate(`/member/report-detail/?studentId=${record.studentId}`)
              }
            />
          </CustomTooltip>
          {userData?.isLeader && userData?.studentId != "0" && (
            <CustomTooltip content="Remove member">
              <Button
                icon={<DeleteOutlined />}
                type="text"
                onClick={() => {
                  setStudentSelect(record);
                  setOpenRemoveModal(true);
                }}
              />
            </CustomTooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="tablePadding">
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          type="text"
          onClick={() => {
            getListStudents();
            setOpenAddModal(true);
          }}
          style={{
            display:
              userData?.isLeader && userData?.studentId != "0"
                ? undefined
                : "none",
            float: "left",
          }}
          disabled={totalMember === studentList?.length}
        >
          Add a member
        </Button>
        <Select
          style={{
            width: 200,
            height: 40,
            display: userData?.studentId == "0" ? undefined : "none",
            float: "right",
          }}
          showSearch
          allowClear
          placeholder="Select a project"
          options={option}
          onChange={(e) => setFilter(e)}
        />
      </div>
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
      <CustomModal
        title="Add Student"
        open={openAddModal}
        onOk={form.submit}
        onCancel={() => setOpenAddModal(false)}
      >
        <Form form={form} layout="vertical" onFinish={addStudentFunction}>
          <Form.Item
            label={<div style={{ fontWeight: 600 }}>Student</div>}
            name="student"
            rules={[
              {
                required: true,
                message: "Please select a student!",
              },
            ]}
          >
            <Select
              options={listStudents}
              style={{ width: 300, height: 40 }}
              placeholder="Select a student"
            />
          </Form.Item>
        </Form>
      </CustomModal>
      <CustomModal
        title="Confirm delete student"
        open={openRemoveModal}
        onOk={() => removeStudentFunction()}
        onCancel={() => setOpenRemoveModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to delete the below student, it will be permanently
          deleted
        </div>
        <CustomText label="Template name">
          {studentSelect?.studentName}
        </CustomText>
        <CustomText label="Hust ID">{studentSelect?.hustId}</CustomText>
        <CustomText label="Added By">
          {studentSelect?.createdByName ?? "Admin"}
        </CustomText>
        <CustomText label="Added Date">
          {dayjs(studentSelect?.createdDate).format("DD/MMM/YYYY HH:mm")}
        </CustomText>
      </CustomModal>
    </div>
  );
};

export default MemberList;
