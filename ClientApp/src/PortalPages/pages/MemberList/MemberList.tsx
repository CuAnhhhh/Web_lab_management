import {
  DeleteOutlined,
  FormOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, notification, Select, Table, TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addStudent,
  getMemberList,
  getStudentIdList,
  removeStudent,
} from "src/PortalPages/api/StudentApi";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Student } from "src/PortalPages/model/StudentModel";

const studentStatus: { label: string; value: number }[] = [
  { label: "First year", value: 101 },
  { label: "Second year", value: 102 },
  { label: "Third year", value: 103 },
  { label: "Fourth year", value: 104 },
  { label: "Fifth year", value: 105 },
  { label: "Sixth year", value: 106 },
  { label: "Leaved", value: 107 },
];

const MemberList = () => {
  const [form] = Form.useForm();
  const [studentList, setStudentList] = useState<Student.StudentListModel[]>();
  const [studentSelect, setStudentSelect] =
    useState<Student.StudentListModel>();
  const [reload, setReload] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [listStudents, setListStudents] =
    useState<{ label?: string; value: string }[]>();
  const [totalMember, setTotalMember] = useState<number>(0);
  const [isLeader, setIsLeader] = useState(false);
  const [projectId, setProjectId] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");
  const navigate = useNavigate();

  const trigger = () => setReload(!reload);

  useEffect(() => {
    getMemberListFucntion();
  }, [reload]);

  const getMemberListFucntion = async () => {
    try {
      const result = await getMemberList(userData?.studentId);
      if (result?.isDone) {
        setStudentList(result?.studentList);
        setTotalMember(result?.total ?? 0);
        setIsLeader(result?.isLeader ?? false);
        setProjectId(result?.projectId ?? "");
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
  };

  const getListStudents = async () => {
    try {
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
  };

  const addStudentFunction = async () => {
    const student: Student.RelationshipStudentModel = {
      studentId: form.getFieldValue("student"),
      projectId: projectId,
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };
    try {
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
  };

  const removeStudentFunction = async () => {
    const student: Student.RelationshipStudentModel = {
      studentId: studentSelect?.studentId,
      projectId: projectId,
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };
    try {
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
  };

  const columns: TableProps<Student.StudentListModel>["columns"] = [
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
      title: "Status",
      key: "status",
      render: (_, record) => (
        <div>
          {studentStatus.find((item) => item?.value == record?.status)?.label}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div
          style={{
            display:
              (userData?.studentId === record?.studentId) ===
              (isLeader || userData?.studentId == "0")
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
          {isLeader && (
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
      <div style={{ display: isLeader ? "flex" : "none", gap: 8 }}>
        <Button
          icon={<PlusCircleOutlined />}
          className="commonButton"
          type="text"
          onClick={() => {
            getListStudents();
            setOpenAddModal(true);
          }}
          disabled={totalMember === studentList?.length}
        >
          Add a member
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={studentList}
        className="borderTable"
        rowKey={(record) => record.studentId ?? ""}
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
        title="Confirm remove student"
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
      </CustomModal>
    </div>
  );
};

export default MemberList;
