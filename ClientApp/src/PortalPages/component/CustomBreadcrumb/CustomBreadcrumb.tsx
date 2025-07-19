import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useLocation } from "react-router-dom";

interface IBreadcrumb {
  title: string;
  key: string;
}

const BreadcrumbProps: IBreadcrumb[] = [
  {
    title: "Project",
    key: "project",
  },
  {
    title: "Project list",
    key: "project-list",
  },
  {
    title: "Project detail",
    key: "project-detail",
  },
  {
    title: "Project report",
    key: "project-report",
  },
  {
    title: "Project report detail",
    key: "project-report-detail",
  },
  {
    title: "Add a project",
    key: "create-project",
  },
  {
    title: "Student",
    key: "student",
  },
  {
    title: "Student list",
    key: "student-list",
  },
  {
    title: "Add a student",
    key: "create-student",
  },
  {
    title: "Edit a student",
    key: "edit-student",
  },
  {
    title: "Student Detail",
    key: "student-detail",
  },
  {
    title: "Scheduler",
    key: "scheduler",
  },
  {
    title: "Overview",
    key: "overview",
  },
  {
    title: "Template",
    key: "template",
  },
  {
    title: "Member",
    key: "member",
  },
  {
    title: "Member list",
    key: "member-list",
  },
  {
    title: "Report detail",
    key: "report-detail",
  },
  {
    title: "Cofiguration",
    key: "cofiguration",
  },
  {
    title: "Project Type",
    key: "project-type",
  },
  {
    title: "Student Role",
    key: "student-role",
  },
  {
    title: "Chat box",
    key: "chat-box",
  },
];

const CustomBreadcrumb = () => {
  const location = useLocation()?.pathname;
  const defaultBreadcrumb: BreadcrumbItemType = {
    title: <HomeOutlined />,
  };

  const listParam = location?.split("/").filter((item) => item !== "");
  const breadcrumbItem = listParam?.map((item) => {
    const temp = BreadcrumbProps.find((p) => p.key === item) ?? {
      title: "",
      key: "",
    };
    return temp as BreadcrumbItemType;
  });

  return (
    <Breadcrumb
      items={[defaultBreadcrumb, ...breadcrumbItem]}
      style={{ backgroundColor: "#f8fbfe" }}
    />
  );
};

export default CustomBreadcrumb;
