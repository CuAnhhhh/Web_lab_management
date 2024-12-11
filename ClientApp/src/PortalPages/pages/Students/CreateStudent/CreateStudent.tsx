import { Button, Form, Input, notification, Radio, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentRoleList } from "src/PortalPages/api/ConfigurationApi";
import {
  createStudent,
  getStudentDetailEdit,
} from "src/PortalPages/api/StudentApi";
import { Student } from "src/PortalPages/model/StudentModel";
import style from "./CreateStudent.module.scss";

const nationality: { label: string; value: number }[] = [
  { label: "Vietnam", value: 101 },
  { label: "Laos", value: 102 },
  { label: "Cambodia", value: 103 },
];

const studentStatus: { label: string; value: number }[] = [
  { label: "First year", value: 101 },
  { label: "Second year", value: 102 },
  { label: "Third year", value: 103 },
  { label: "Fourth year", value: 104 },
  { label: "Fifth year", value: 105 },
  { label: "Sixth year", value: 106 },
];

const CreateStudent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const [roleList, setRoleList] =
    useState<{ label?: string; value: string }[]>();

  const getListStudentRole = async () => {
    try {
      const result = await getStudentRoleList();
      if (result?.isDone) {
        setRoleList(
          result?.studentRoleList?.map((item) => ({
            label: item?.studentRoleName,
            value: item?.studentRoleId ?? "",
          }))
        );
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const getStudentDetail = async () => {
    try {
      const result = await getStudentDetailEdit(studentId);
      if (result?.isDone) {
        form.setFieldValue("hustID", result?.studentDetail?.hustId);
        form.setFieldValue("studentName", result?.studentDetail?.studentName);
        form.setFieldValue("email", result?.studentDetail?.email);
        form.setFieldValue("address", result?.studentDetail?.address);
        form.setFieldValue("phoneNumber", result?.studentDetail?.phoneNumber);
        form.setFieldValue("nationality", result?.studentDetail?.nationality);
        form.setFieldValue("gender", result?.studentDetail?.gender);
        form.setFieldValue("studentRole", result?.studentDetail?.studentRole);
        form.setFieldValue("status", result?.studentDetail?.status);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  useEffect(() => {
    getListStudentRole();
    getStudentDetail();
  }, []);

  const submitForm = async () => {
    const model: Student.StudentListModel = {
      studentId: studentId || undefined,
      hustId: form.getFieldValue("hustID"),
      studentName: form.getFieldValue("studentName"),
      email: form.getFieldValue("email"),
      address: form.getFieldValue("address"),
      phoneNumber: form.getFieldValue("phoneNumber"),
      nationality: form.getFieldValue("nationality"),
      gender: form.getFieldValue("gender"),
      studentRole: form.getFieldValue("studentRole"),
      status: form.getFieldValue("status"),
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };

    try {
      const result = await createStudent(model);
      if (result?.isDone) {
        notification.open({
          message: "Create student successed",
          type: "success",
        });
        navigate(`/student/student-list`);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="WLM_FormLayout">
        <Form form={form} layout="vertical" onFinish={submitForm}>
          <Form.Item
            label="Student name"
            name="studentName"
            rules={[
              {
                required: true,
                message: "Please input student name!",
              },
            ]}
          >
            <Input style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            label="Hust ID"
            name="hustID"
            rules={[
              {
                required: true,
                message: "Please input the Hust ID!",
              },
            ]}
          >
            <Input style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            label="Phone number"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Please add a Phone Number!",
              },
            ]}
          >
            <Input style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please add a Email!",
              },
            ]}
          >
            <Input style={{ height: 40 }} />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input style={{ height: 40 }} />
          </Form.Item>
          <Form.Item label="Nationality" name="nationality">
            <Select options={nationality} style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[
              {
                required: true,
                message: "Please choose student gender!",
              },
            ]}
          >
            <Radio.Group>
              <Radio value={false}>Male</Radio>
              <Radio value={true}>Female</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Student role"
            name="studentRole"
            rules={[
              {
                required: true,
                message: "Please select student role!",
              },
            ]}
          >
            <Select options={roleList} style={{ height: 40 }} />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: "Please select student status!",
              },
            ]}
          >
            <Select options={studentStatus} style={{ height: 40 }} />
          </Form.Item>
        </Form>
      </div>
      <div className={style.bottomButton}>
        <Button onClick={() => navigate(`/student/student-list`)}>
          Cancel
        </Button>
        <Button onClick={form.submit} type="primary">
          Submit
        </Button>
      </div>
    </>
  );
};

export default CreateStudent;
