import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, notification, Table, TableProps, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectList } from "src/PortalPages/api/ProjectApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Project } from "src/PortalPages/model/ProjectModel";
import RemoveProject from "../RemoveProject/RemoveProject";

interface IProjectTable {
  tab: string;
  currentTab?: string;
  open?: boolean;
  closePanel?: () => void;
  filter?: string;
}

const OpenProjectTable = ({
  open,
  closePanel,
  tab,
  currentTab,
  filter,
}: IProjectTable) => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<Project.ProjectListModel[]>();
  const [reload, setReload] = useState(false);
  const { openLoading, closeLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);

  const trigger = () => setReload(!reload);

  useEffect(() => {
    if (tab === currentTab) getProjectListFunction();
  }, [reload, currentTab, currentPage, filter]);

  const getProjectListFunction = async () => {
    const model: Project.GetProjectListModel = {
      currentPage: currentPage,
      searchValue: filter,
      state: tab == "open",
    };
    try {
      openLoading();
      const result = await getProjectList(model);
      if (result?.isDone) {
        setProjectList(result?.projectList);
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

  const onRenderAlert = () => (
    <CustomTooltip
      content={"This project have been over 16 week. Please check detail!"}
    >
      <InfoCircleOutlined style={{ color: "red", cursor: "pointer" }} />
    </CustomTooltip>
  );

  const columns: TableProps<Project.ProjectListModel>["columns"] = [
    {
      title: "Project name",
      key: "name",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="text"
            onClick={() =>
              navigate(`/project/project-detail/?projectId=${record.projectId}`)
            }
          >
            <CustomTooltip content={record?.projectName} maxWidth={150} />
          </Button>
          {dayjs().diff(record?.createdDate, "week") > 15 && onRenderAlert()}
        </div>
      ),
    },
    {
      title: "Description",
      key: "description",
      render: (_, record) => (
        <CustomTooltip content={record?.description || "N/A"} maxWidth={250} />
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
        <div>{dayjs(record?.createdDate).format("DD/MMM/YYYY HH:mm")}</div>
      ),
    },
  ];

  const columnsClose: TableProps<Project.ProjectListModel>["columns"] = [
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
    {
      title: "Close reason",
      key: "reason",
      render: (_, record) => (
        <CustomTooltip content={record?.reason ?? "N/A"} maxWidth={200} />
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns.concat(tab == "open" ? columnsOpen : columnsClose)}
        dataSource={projectList}
        className="borderTable"
        rowKey={(record) => record.projectId ?? ""}
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: totalRecord,
          simple: true,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: "max-content" }}
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
