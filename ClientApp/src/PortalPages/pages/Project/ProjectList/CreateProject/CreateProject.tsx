import { DeleteOutlined, MehOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, notification, Radio, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectTypeList } from "src/PortalPages/api/ConfigurationApi";
import { createProject } from "src/PortalPages/api/ProjectApi";
import { getStudentIdList } from "src/PortalPages/api/StudentApi";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Project } from "src/PortalPages/model/ProjectModel";
import { IOptionType } from "../ProjectListModel";
import style from "./CreateProject.module.scss";

const CreateProject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search);
  const projectId = urlQuery.get("projectId") ?? "";
  const [collaboration, setCollaboration] = useState<boolean>(false);
  const [sameName, setSameName] = useState<boolean>(false);
  const [maximumCount, setMaximumCount] = useState<number>(0);
  const [projectType, setProjectType] =
    useState<{ label?: string; value: string }[]>();
  const [listStudents, setListStudents] =
    useState<{ label?: string; value: string }[]>();
  const [listSelectedStudents, setListSelectedStudents] = useState<string[]>([
    "",
  ]);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "");
  const uploadRef = useRef<FileUploadPropsRef>(null);

  const maximum: IOptionType[] = [...Array(14).keys()].map((item) => ({
    label: `${item + 1}`,
    value: item + 1,
  }));

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

  const getListProjectRole = async () => {
    try {
      const result = await getProjectTypeList();
      if (result?.isDone) {
        setProjectType(
          result?.projectTypeList?.map((item) => ({
            label: item?.projectTypeName,
            value: item?.projectTypeId ?? "",
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

  useEffect(() => {
    getListStudents();
    getListProjectRole();
  }, []);

  useEffect(() => {
    sameName && form.validateFields(["projectName"]);
  }, [sameName]);

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
    <div style={{ border: "1px solid #d9d9d9", padding: 16, marginBottom: 16 }}>
      <Form.List name="membersList">
        {(fields, { add, remove }) => (
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
                label={
                  <div>
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>
                    {`Member number ${index + 1}`}
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: "Please select the collaboration member!",
                  },
                ]}
                key={field.key}
              >
                <Select
                  options={getListOption(index + 1)}
                  style={{ width: 500, height: 40 }}
                  placeholder="Select a name"
                  onChange={(value: string) => onSelectOption(value, index + 1)}
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
            validator: () => {
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
          style={{ height: 40 }}
          placeholder="Input a name"
          onChange={() => sameName && setSameName(false)}
        />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea rows={5} style={{ resize: "none" }} />
      </Form.Item>
      <Form.Item
        label="Project type"
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
          style={{ height: 40 }}
          placeholder="Select a type"
        />
      </Form.Item>
    </>
  );

  const onRenderCollaboration = () => (
    <div>
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
              form.setFieldValue("header", undefined);
              if (collaboration && maximumCount) {
                form.setFieldValue("membersList", undefined);
                form.setFieldValue("maxCount", undefined);
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
              form.setFieldValue("header", undefined);
            }}
          >
            Group
          </Radio>
        </Radio.Group>
      </Form.Item>
      <div style={{ display: "flex", gap: 64 }}>
        <Form.Item label="Header" name="header">
          <Select
            options={getListOption(0)}
            style={{ width: 300, height: 40 }}
            placeholder="Select a student"
            onChange={(value: string) => onSelectOption(value, 0)}
          />
        </Form.Item>
        {collaboration && (
          <Form.Item label="Maximum membership count" name="maxCount">
            <Select
              options={maximum}
              style={{ width: 300, height: 40 }}
              placeholder="Select a number"
              onChange={(e) => setMaximumCount(e)}
            />
          </Form.Item>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="WLM_FormLayout">
        <Form form={form} layout="vertical" onFinish={submitForm}>
          {onRenderInformation()}
          {onRenderCollaboration()}
          {collaboration && onRenderMemberList()}
          <Form.Item label="Documents">
            <FileUpload serviceType="projects" ref={uploadRef} />
          </Form.Item>
        </Form>
      </div>
      <div className={style.bottomButton}>
        <Button onClick={() => navigate(`/project/project-list`)}>
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
