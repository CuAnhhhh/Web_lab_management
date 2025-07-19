import {
  CloseOutlined,
  EditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  notification,
  Select,
  Table,
  TableProps,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { getProjectTypeIdList } from "src/PortalPages/api/ConfigurationApi";
import {
  completeProject,
  createProject,
  getProjectDetail,
} from "src/PortalPages/api/ProjectApi";
import { getStudentIdList } from "src/PortalPages/api/StudentApi";
import CustomCard from "src/PortalPages/component/CustomCard/CustomCard";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import {
  FileUpload,
  FileUploadPropsRef,
} from "src/PortalPages/component/UploadSupport/FileUpload";
import { Project } from "src/PortalPages/model/ProjectModel";
import { Student } from "src/PortalPages/model/StudentModel";
import style from "./ProjectDetail.module.scss";
import CustomModal from "src/PortalPages/component/CustomModal/CustomModal";
import { useNavigate } from "react-router-dom";

interface IOption {
  label?: string;
  value: string;
}

const ProjectDetail = () => {
  const [form] = Form.useForm();
  const urlQuery = new URLSearchParams(location.search);
  const projectId = urlQuery.get("projectId") ?? "";
  const navigate = useNavigate();
  const [projectDetail, setProjectDetail] =
    useState<Project.ProjectDetailModel>();
  const uploadRef = useRef<FileUploadPropsRef>(null);
  const { openLoading, closeLoading } = useLoading();
  const [projectType, setProjectType] = useState<IOption[]>();
  const [listStudents, setListStudents] = useState<IOption[]>();
  const [sameName, setSameName] = useState<boolean>(false);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const isAdmin = userData?.studentRole === "0";
  const [editInfo, setEditInfo] = useState(false);
  const [editDoc, setEditDoc] = useState(false);
  const [onChangeForm, setOnChangeForm] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const maximum: {
    label: string;
    value: number;
  }[] = [...Array(14).keys()].map((item) => ({
    label: `${item + 1}`,
    value: item + 1,
  }));

  useEffect(() => {
    if (projectId) {
      getProjectDetailFucntion();
      uploadRef?.current?.setServiceId(projectId);
    }
  }, [projectId, editInfo]);

  useEffect(() => {
    if (editInfo) {
      form.setFieldValue("projectName", projectDetail?.projectName);
      form.setFieldValue("description", projectDetail?.description);
      form.setFieldValue("projectType", projectDetail?.projectTypeId);
      form.setFieldValue(
        "header",
        projectDetail?.relationshipList?.find((item) => item?.isLeader)
          ?.studentId
      );
      form.setFieldValue("maxCount", (projectDetail?.totalMember ?? 1) - 1);
      getListProjectType(projectDetail?.isWeeklyReport);
      const option: IOption[] =
        projectDetail?.relationshipList?.map((item) => ({
          value: item?.studentId ?? "",
          label: item?.studentName,
        })) ?? [];
      getListStudents(option);
    }
  }, [editInfo]);

  const getProjectDetailFucntion = async () => {
    try {
      openLoading();
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
    closeLoading();
  };

  const getListStudents = async (model: IOption[]) => {
    try {
      openLoading();
      const result = await getStudentIdList();
      if (result?.isDone) {
        const list =
          result?.studentList?.map((item) => ({
            label: item?.studentName,
            value: item?.studentId ?? "",
          })) ?? [];
        setListStudents([...model, ...list]);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  const getListProjectType = async (type?: boolean) => {
    try {
      openLoading();
      const result = await getProjectTypeIdList(type);
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
    closeLoading();
  };

  const completeProjectFunction = async () => {
    const model: Project.DeleteProjectModel = {
      projectId: projectDetail?.projectId,
      removedBy: userData?.studentId,
      removedDate: dayjs().format(),
      reason: "Project have been completed!",
    };

    try {
      openLoading();
      const result = await completeProject(model);
      if (result?.isDone) {
        notification.open({
          message: "Complete project successed",
          type: "success",
        });
        navigate(`/project/project-list`);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
    closeLoading();
  };

  const columns: TableProps<Student.RelationshipStudentModel>["columns"] = [
    {
      title: "Student name",
      key: "name",
      render: (_, record) => <div>{record?.studentName}</div>,
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
      render: (_, record) => <div>{record?.createdBy ?? "Admin"}</div>,
    },
    {
      title: "Added Date",
      key: "createdDate",
      render: (_, record) => (
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY HH:mm")}</div>
      ),
    },
  ];

  useEffect(() => {
    sameName && form.validateFields(["projectName"]);
  }, [sameName]);

  const submitForm = async () => {
    const model: Project.ProjectCreateModel = {
      projectId: projectId,
      projectName: form.getFieldValue("projectName"),
      description: form.getFieldValue("description"),
      projectTypeId: form.getFieldValue("projectType"),
      memberList: [{ studentId: form.getFieldValue("header") }],
      totalMember: form.getFieldValue("maxCount") + 1,
      createdDate: dayjs().format(),
      createdBy: userData?.studentId,
    };

    try {
      openLoading();
      const result = await createProject(model);
      if (result?.isDone) {
        await uploadRef?.current?.uploadFuntion(result?.id ?? "");
        notification.open({
          message: "Update project successed",
          type: "success",
        });
        setEditInfo(false);
        setOnChangeForm(false);
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

  const onRenderInformation = () => (
    <>
      <div style={{ display: "flex" }}>
        <CustomText label="Project Name">
          <CustomTooltip content={projectDetail?.projectName} maxWidth={200} />
        </CustomText>
        <CustomText label="Description">
          <CustomTooltip
            content={projectDetail?.description || "N/A"}
            maxWidth={200}
          />
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Project type">
          <CustomTooltip content={projectDetail?.projectTypeName} />
        </CustomText>
        <CustomText label="Collaboration">
          {projectDetail?.collaboration ? "Group" : "Single"}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Total member">
          {projectDetail?.totalMember}
        </CustomText>
        <CustomText label="Status">
          {projectDetail?.isActive ? (
            <Tag color="success">In Progress</Tag>
          ) : (
            <Tag color="error">Closed</Tag>
          )}
        </CustomText>
      </div>
      <div style={{ display: "flex" }}>
        <CustomText label="Created by">
          {projectDetail?.createdBy ?? "Admin"}
        </CustomText>
        <CustomText label="Created date">
          {dayjs(projectDetail?.createdDate).format("DD/MMM/YYYY HH:mm")}
        </CustomText>
      </div>
      {!projectDetail?.isActive && (
        <>
          <div style={{ display: "flex" }}>
            <CustomText label="Removed by">
              {projectDetail?.removedBy ?? "Admin"}
            </CustomText>
            <CustomText label="Removed date">
              {dayjs(projectDetail?.removedDate).format("DD/MMM/YYYY HH:mm")}
            </CustomText>
          </div>
          <div style={{ display: "flex" }}>
            <CustomText label="Closed reason">
              {projectDetail?.reason}
            </CustomText>
          </div>
        </>
      )}
    </>
  );

  const onRenderEditInformation = () => (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        onChange={() => setOnChangeForm(true)}
      >
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
            size="large"
            placeholder="Select a type"
            onChange={() => setOnChangeForm(true)}
          />
        </Form.Item>
        <div style={{ display: "flex", gap: 64 }}>
          <Form.Item
            label="Header"
            name="header"
            rules={[
              {
                required: true,
                message: "Please select the project leader!",
              },
            ]}
          >
            <Select
              options={listStudents}
              style={{ width: 300, height: 40 }}
              placeholder="Select a student"
              allowClear
              onChange={() => setOnChangeForm(true)}
            />
          </Form.Item>
          {projectDetail?.collaboration && (
            <Form.Item
              label="Maximum membership count"
              name="maxCount"
              rules={[
                {
                  required: true,
                  message: "Please select the maximum member!",
                },
                {
                  validator: async (_, value) => {
                    const number =
                      (value ?? 1) -
                      (projectDetail?.relationshipList?.length ?? 1);
                    if (number < -1) {
                      return Promise.reject(
                        new Error(
                          `This amount of member is less than the current member in project.Please remove ${-number} student to select this option!`
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                options={maximum.filter(
                  (item) =>
                    item.value >= (projectDetail?.relationshipList?.length ?? 0)
                )}
                style={{ width: 300, height: 40 }}
                placeholder="Select a number"
              />
            </Form.Item>
          )}
        </div>
      </Form>
      <div className={style.formInfoButton}>
        <Button
          onClick={
            onChangeForm
              ? () => setOpenModal(true)
              : () => {
                  setEditInfo(false);
                  setOnChangeForm(false);
                }
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

  const onRenderMember = () => (
    <Table
      columns={columns}
      dataSource={projectDetail?.relationshipList}
      className="borderTable"
      rowKey={(record) => record.relationshipId ?? ""}
      scroll={{ x: "max-content" }}
      pagination={false}
    />
  );

  const onRenderDocument = () => (
    <FileUpload serviceType="projects" ref={uploadRef} viewOnly={!editDoc} />
  );

  const onRenderExtra = (status: boolean) => (
    <CustomTooltip content={editInfo ? "Cancel" : "Edit"}>
      <Button
        icon={
          (status ? editInfo : editDoc) ? <CloseOutlined /> : <EditOutlined />
        }
        type="text"
        style={{ marginRight: 8 }}
        onClick={(e) => {
          e.stopPropagation();
          status ? setEditInfo(!editInfo) : setEditDoc(!editDoc);
        }}
      />
    </CustomTooltip>
  );

  return (
    <>
      <div className="formDetailPadding">
        <CustomCard
          label="Information"
          extra={isAdmin ? onRenderExtra(true) : undefined}
        >
          {editInfo ? onRenderEditInformation() : onRenderInformation()}
        </CustomCard>
        <CustomCard label="Member">{onRenderMember()}</CustomCard>
        <CustomCard
          label="Document"
          extra={isAdmin ? onRenderExtra(false) : undefined}
        >
          {onRenderDocument()}
        </CustomCard>
      </div>
      <div className={style.bottomButton}>
        <Button
          onClick={() =>
            onChangeForm
              ? setOpenModal(true)
              : navigate(`/project/project-list`)
          }
        >
          Back
        </Button>
        <Button
          onClick={completeProjectFunction}
          type="primary"
          style={{
            display:
              dayjs().diff(projectDetail?.createdDate, "week") > 15
                ? undefined
                : "none",
          }}
        >
          Complete Project
        </Button>
      </div>
      <CustomModal
        title={
          <div>
            <ExclamationCircleFilled style={{ color: "#08c" }} /> Discard change
          </div>
        }
        open={openModal}
        onOk={() => {
          setEditInfo(false);
          setOpenModal(false);
          setOnChangeForm(false);
        }}
        onCancel={() => setOpenModal(false)}
      >
        <div style={{ fontWeight: 600, paddingBottom: 16 }}>
          Do you want to cancel edit project. All infomation will be removed!
        </div>
      </CustomModal>
    </>
  );
};

export default ProjectDetail;
