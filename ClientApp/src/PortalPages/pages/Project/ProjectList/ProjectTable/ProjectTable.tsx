import { EditOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectList } from "src/PortalPages/api/ProjectApi";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Project } from "src/PortalPages/model/ProjectModel";
import RemoveProject from "../RemoveProject/RemoveProject";

interface IProjectTable {
  tab?: string;
  currentTab?: string;
  open?: boolean;
  closePanel?: () => void;
}

const OpenProjectTable = ({
  open,
  closePanel,
  tab,
  currentTab,
}: IProjectTable) => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<Project.ProjectListModel[]>();
  const [reload, setReload] = useState(false);

  const trigger = () => setReload(!reload);

  useEffect(() => {
    if (tab === currentTab) getProjectListFunction();
  }, [reload, currentTab]);

  const getProjectListFunction = async () => {
    try {
      const result = await getProjectList(tab ?? "");

      if (result?.isDone) {
        setProjectList(result?.projectList);
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "error",
      });
    }
  };

  const columns: TableProps<Project.ProjectListModel>["columns"] = [
    {
      title: "Project name",
      key: "name",
      render: (_, record) => (
        <Button
          type="text"
          onClick={() =>
            navigate(`/project/project-detail/?projectId=${record.projectId}`)
          }
        >
          {record?.projectName}
        </Button>
      ),
    },
    {
      title: "Project type",
      key: "type",
      render: (_, record) => (
        <Tag style={{ color: "#222222", borderColor: "#97A2AB" }}>
          {record?.projectTypeId}
        </Tag>
      ),
    },
    {
      title: "Collaboration",
      key: "collaboration",
      render: (_, record) => (
        <div>{record?.collaboration ? "Group" : "Single"}</div>
      ),
    },
  ];

  const columnsOpen: TableProps<Project.ProjectListModel>["columns"] = [
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => <div>{record?.createdBy ?? "Admin"}</div>,
    },
    {
      title: "Created Date",
      key: "createdDate",
      render: (_, record) => (
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY")}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <CustomTooltip content="Edit">
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() =>
              navigate(`/project/project-detail/?projectid=${record.projectId}`)
            }
          />
        </CustomTooltip>
      ),
    },
  ];

  const columnsClose: TableProps<Project.ProjectListModel>["columns"] = [
    {
      title: "Removed By",
      key: "removedBy",
      render: (_, record) => <div>{record?.removedBy ?? "N/A"}</div>,
    },
    {
      title: "Removed Date",
      key: "removedDate",
      render: (_, record) => (
        <div>{dayjs(record?.removedDate).format("DD/MMM/YYYY")}</div>
      ),
    },
    {
      title: "Close reason",
      key: "reason",
      render: (_, record) => <div>{record?.reason ?? "N/A"}</div>,
    },
  ];

  return (
    <>
      <Table
        columns={columns.concat(tab == "open" ? columnsOpen : columnsClose)}
        dataSource={projectList}
        className="borderTable"
        rowKey={(record) => record.projectId ?? ""}
      />
      <RemoveProject
        open={open}
        closePanel={() => {
          closePanel?.();
          trigger();
        }}
        projectList={projectList?.map((item) => ({
          value: item?.projectId ?? "",
          label: item?.projectName ?? "",
        }))}
      />
    </>
  );
};

export default OpenProjectTable;
