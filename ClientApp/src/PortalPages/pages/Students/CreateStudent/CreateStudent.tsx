import { ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, notification, Radio, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentRoleIdList } from "src/PortalPages/api/ConfigurationApi";
import {
  createStudent,
  getStudentDetailEdit,
} from "src/PortalPages/api/StudentApi";
import { Student } from "src/PortalPages/model/StudentModel";
import style from "./CreateStudent.module.scss";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

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
  { label: "Master", value: 107 },
  { label: "Engineer", value: 108 },
  { label: "Ph.D.", value: 109 },
];

const CreateStudent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const urlQuery = new URLSearchParams(location.search);
  const studentId = urlQuery.get("studentId") ?? "";
  const { openLoading, closeLoading } = useLoading();
  const [sameId, setSameId] = useState<boolean>(false);
  const [roleList, setRoleList] =
    useState<{ label?: string; value: string }[]>();
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const getListStudentRole = async () => {
    try {
      openLoading();
      const result = await getStudentRoleIdList();
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
    closeLoading();
  };

  const getStudentDetail = async () => {
    try {
      openLoading();
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
    closeLoading();
  };

  useEffect(() => {
    getListStudentRole();
    getStudentDetail();
  }, []);

  useEffect(() => {
    sameId && form.validateFields(["hustID"]);
  }, [sameId]);

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
      openLoading();
      const result = await createStudent(model);
      if (result?.isDone) {
        notification.open({
          message: "Create student successed",
          type: "success",
        });
        navigate(`/student/student-list`);
      } else {
        notification.open({
          message: result?.error,
          type: "error",
        });
        if (result?.errorCode == 101) {
          setSameId(true);
        }
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  return (
    <>
      <div className="WLM_FormLayout">
        <Form
          form={form}
          layout="vertical"
          onFinish={submitForm}
          onChange={() => setOnChangeForm(true)}
        >
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
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Hust ID"
            name="hustID"
            rules={[
              {
                required: true,
                message: "Please input the Hust ID!",
              },
              {
                validator: async () => {
                  if (sameId) {
                    return Promise.reject(
                      new Error("There is a student with the same HUST ID!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Input a hust id"
              onChange={() => sameId && setSameId(false)}
            />
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
            <Input size="large" />
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
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Nationality" name="nationality">
            <Select
              options={nationality}
              size="large"
              allowClear
              onChange={() => setOnChangeForm(true)}
            />
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
          <Form.Item label="Student role" name="studentRole">
            <Select
              options={roleList}
              size="large"
              onChange={() => setOnChangeForm(true)}
            />
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
            <Select
              options={studentStatus}
              size="large"
              onChange={() => setOnChangeForm(true)}
            />
          </Form.Item>
        </Form>
      </div>
      <div className={style.bottomButton}>
        <Button
          onClick={() =>
            onChangeForm
              ? setOpenModal(true)
              : navigate(`/student/student-list`)
          }
        >
          Cancel
        </Button>
        <Button onClick={form.submit} type="primary">
          Submit
        </Button>
      </div>
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={() => navigate(`/student/student-list`)}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel create student. All infomation will be removed!
        </div>
      </CustomModal>
    </>
  );
};

export default CreateStudent;
