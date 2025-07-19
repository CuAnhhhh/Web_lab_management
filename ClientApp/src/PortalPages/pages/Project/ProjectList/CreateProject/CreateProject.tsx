import {
  DeleteOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  MehOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, notification, Radio, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectTypeIdList } from "src/PortalPages/api/ConfigurationApi";
import { createProject } from "src/PortalPages/api/ProjectApi";
import { getStudentIdList } from "src/PortalPages/api/StudentApi";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Project } from "src/PortalPages/model/ProjectModel";
import { IOption, IOptionType } from "../ProjectListModel";
import style from "./CreateProject.module.scss";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";

const CreateProject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [collaboration, setCollaboration] = useState<boolean>(false);
  const [sameName, setSameName] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>();
  const [maximumCount, setMaximumCount] = useState<number>(0);
  const [projectType, setProjectType] = useState<IOption[]>();
  const [listStudents, setListStudents] = useState<IOption[]>();
  const [listSelectedStudents, setListSelectedStudents] = useState<string[]>([
    "",
  ]);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const { openLoading, closeLoading } = useLoading();
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const maximum: IOptionType[] = [...Array(14).keys()].map((item) => ({
    label: `${item + 1}`,
    value: item + 1,
  }));

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

  const getListProjectType = async () => {
    try {
      openLoading();
      const result = await getProjectTypeIdList();
      if (result?.isDone) {
        setProjectType(
          result?.projectTypeList?.map((item) => ({
            label: item?.projectTypeName,
            value: item?.projectTypeId ?? "",
            isAlert: !item?.isWeeklyReport,
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

  useEffect(() => {
    getListStudents();
    getListProjectType();
  }, []);

  useEffect(() => {
    sameName && form.validateFields(["projectName"]);
  }, [sameName]);

  useEffect(() => {
    maximumCount && form.validateFields(["membersList"]);
  }, [maximumCount]);

  const submitForm = async () => {
    const model: Project.ProjectCreateModel = {
      projectName: form.getFieldValue("projectName"),
      description: form.getFieldValue("description"),
      projectTypeId: form.getFieldValue("projectType"),
      collaboration: form.getFieldValue("collaboration"),
      totalMember: maximumCount + 1,
      memberList: listStudents
        ?.filter((item) => listSelectedStudents.includes(item?.value))
        ?.map((item) => ({ studentId: item?.value, studentName: item?.label })),
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };

    try {
      openLoading();
      const result = await createProject(model);
      if (result?.isDone) {
        await uploadRef?.current?.uploadFuntion(result?.id ?? "");
        notification.open({
          message: "Create project successed",
          type: "success",
        });
        navigate(`/project/project-list`);
      }
      if (result?.errorCode === 101) {
        setSameName(true);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const getListOption = (index: number) => {
    const newList = listSelectedStudents.filter((_, i) => i !== index);
    return listStudents?.filter((item) => !newList.includes(item?.value)) ?? [];
  };

  const onSelectOption = (value: string, index: number) => {
    const newList = [...listSelectedStudents];
    newList[index] = value;
    setListSelectedStudents(newList);
  };

  const onRenderMemberList = () => (
    <div className={style.formList}>
      <Form.List
        name="membersList"
        rules={[
          {
            validator: async (_, members) => {
              if (members?.length > maximumCount) {
                return Promise.reject(
                  new Error(
                    "There is more member than the total member of the project. Please remove some member!"
                  )
                );
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            <Form.Item>
              <Button
                onClick={() => {
                  add();
                  setListSelectedStudents([...listSelectedStudents, ""]);
                }}
                type="primary"
                icon={<PlusOutlined />}
                disabled={fields.length > maximumCount - 1}
              >
                Add Member
              </Button>
            </Form.Item>
            {fields.length === 0 && (
              <div style={{ fontWeight: 500, textAlign: "center" }}>
                <MehOutlined /> You have not input any member
              </div>
            )}
            {fields.map((field, index) => (
              <Form.Item
                name={`MemberSelect${index}`}
                label={`Member number ${index + 1}`}
                rules={[
                  {
                    validator: async () => {
                      if (listSelectedStudents[index + 1] == "") {
                        return Promise.reject(
                          new Error(
                            "Please select the collaboration member or remove this field!"
                          )
                        );
                      }
                    },
                  },
                ]}
                key={field.key}
              >
                <Select
                  options={getListOption(index + 1)}
                  style={{ width: 500, height: 40 }}
                  placeholder="Select a name"
                  onChange={(value: string) => {
                    onSelectOption(value, index + 1);
                  }}
                />
                <Button
                  onClick={() => {
                    remove(field.name);
                    setListSelectedStudents(
                      listSelectedStudents.filter((_, i) => i !== index + 1)
                    );
                  }}
                  type="text"
                  icon={<DeleteOutlined />}
                  style={{ marginLeft: 8, height: 40, width: 40 }}
                />
              </Form.Item>
            ))}
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </div>
  );

  const onRenderInformation = () => (
    <>
      <Form.Item
        label="Project name"
        name="projectName"
        rules={[
          {
            required: true,
            message: "Please input the project name!",
          },
          {
            validator: async () => {
              if (sameName) {
                return Promise.reject(
                  new Error("There is a project with the same name!")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input
          size="large"
          placeholder="Input a name"
          onChange={() => sameName && setSameName(false)}
        />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea
          rows={5}
          style={{ resize: "none" }}
          onBlur={(e) =>
            form.setFieldValue("description", e.target.value.trim())
          }
        />
      </Form.Item>
      <Form.Item
        label={
          <div style={{ display: "flex", gap: 8 }}>
            Project type {showAlert && onRenderAlert()}
          </div>
        }
        name="projectType"
        rules={[
          {
            required: true,
            message: "Please select the project type!",
          },
        ]}
      >
        <Select
          options={projectType}
          size="large"
          placeholder="Select a type"
          onChange={(_, option) => {
            setShowAlert((option as IOption)?.isAlert);
          }}
        />
      </Form.Item>
    </>
  );

  const onRenderAlert = () => (
    <CustomTooltip
      content={
        "This project type is not a weekly type, student can create report when it needed"
      }
    >
      <InfoCircleOutlined style={{ color: "red", cursor: "pointer" }} />
    </CustomTooltip>
  );

  const onRenderCollaboration = () => (
    <>
      <Form.Item
        label="Collaboration preference"
        name="collaboration"
        rules={[
          {
            required: true,
            message: "Please select the collaboration preference!",
          },
        ]}
        initialValue={false}
      >
        <Radio.Group value={false}>
          <Radio
            value={false}
            onClick={() => {
              setCollaboration(false);
              setListSelectedStudents([""]);
              form.resetFields(["leader"]);
              if (collaboration && maximumCount) {
                form.resetFields(["maxCount", "membersList"]);
                setMaximumCount(0);
              }
            }}
          >
            Single
          </Radio>
          <Radio
            value={true}
            onClick={() => {
              setCollaboration(true);
              setListSelectedStudents([""]);
              form.resetFields(["leader"]);
            }}
          >
            Group
          </Radio>
        </Radio.Group>
      </Form.Item>
      <div style={{ display: "flex", gap: 64 }}>
        <Form.Item
          label={collaboration ? "Leader" : "Participant"}
          name="leader"
          rules={[
            {
              required: true,
              message: `Please select the project ${
                collaboration ? "leader" : "Participant"
              }!`,
            },
          ]}
        >
          <Select
            options={getListOption(0)}
            style={{ width: 300, height: 40 }}
            placeholder="Select a student"
            allowClear
            onChange={(value: string) => onSelectOption(value, 0)}
          />
        </Form.Item>
        {collaboration && (
          <Form.Item
            label="Maximum membership count"
            name="maxCount"
            rules={[
              {
                required: true,
                message: "Please select the maximum member!",
              },
            ]}
          >
            <Select
              options={maximum}
              style={{ width: 300, height: 40 }}
              placeholder="Select a number"
              onChange={(e) => setMaximumCount(e)}
            />
          </Form.Item>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="WLM_FormLayout">
        <Form
          form={form}
          layout="vertical"
          onFinish={submitForm}
          onChange={() => setOnChangeForm(true)}
        >
          {onRenderInformation()}
          {onRenderCollaboration()}
          {collaboration && onRenderMemberList()}
          <Form.Item label="Documents">
            <FileUpload serviceType="projects" ref={uploadRef} />
          </Form.Item>
        </Form>
        <CustomModal
          title={
            <div>
              <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard
              change
            </div>
          }
          open={openModal}
          onOk={() => navigate(`/project/project-list`)}
          onCancel={() => setOpenModal(false)}
        >
          <div style={{ fontWeight: 600, paddingBottom: 16 }}>
            Do you want to cancel create project. All infomation will be
            removed!
          </div>
        </CustomModal>
      </div>
      <div className={style.bottomButton}>
        <Button
          onClick={() =>
            onChangeForm
              ? setOpenModal(true)
              : navigate(`/project/project-list`)
          }
        >
          Cancel
        </Button>
        <Button onClick={form.submit} type="primary">
          Submit
        </Button>
      </div>
    </>
  );
};

export default CreateProject;
