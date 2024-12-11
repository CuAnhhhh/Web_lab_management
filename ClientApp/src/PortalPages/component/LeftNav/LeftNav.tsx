import { BarsOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { MenuItemType } from "antd/es/menu/interface";
import { useNavigate } from "react-router-dom";
import style from "./LeftNav.module.scss";

type CustomMenuItem = MenuItemType & {
  path?: string;
  children?: CustomMenuItem[];
};

const LeftNav = () => {
  const navigate = useNavigate();
  const isAdmin =
    JSON.parse(localStorage.getItem("userData") ?? "")?.studentId === "0";
  const navItems: CustomMenuItem[] = [
    {
      label: "Overview",
      onClick: () => navigate("/overview"),
      icon: <BarsOutlined />,
      key: "overview",
    },
    {
      label: "Scheduler",
      onClick: () => navigate("/scheduler"),
      icon: <BarsOutlined />,
      key: "scheduler",
    },
    {
      label: "Template",
      onClick: () => navigate("/template"),
      icon: <BarsOutlined />,
      key: "template",
    },
    {
      label: "Students",
      onClick: () => navigate("/student/student-list"),
      icon: <BarsOutlined />,
      key: "students",
      disabled: !isAdmin,
    },
    {
      label: "Projects",
      icon: <BarsOutlined />,
      key: "projects",
      disabled: !isAdmin,
      children: [
        {
          label: "Project List",
          onClick: () => navigate("/project/project-list"),
          icon: <BarsOutlined />,
          key: "projectList",
        },
        {
          label: "Project Report",
          onClick: () => navigate("/project/project-report"),
          icon: <BarsOutlined />,
          key: "projectReport",
        },
      ],
    },
    {
      label: "Member List",
      onClick: () => navigate("/member/member-list"),
      icon: <BarsOutlined />,
      key: "memberList",
    },
    {
      label: "Cofiguration",
      icon: <BarsOutlined />,
      key: "cofiguration",
      disabled: !isAdmin,
      children: [
        {
          label: "Project Type",
          onClick: () => navigate("/cofiguration/project-type"),
          icon: <BarsOutlined />,
          key: "projectType",
        },
        {
          label: "Student Role",
          onClick: () => navigate("/cofiguration/student-role"),
          icon: <BarsOutlined />,
          key: "studentRole",
        },
      ],
    },
  ];

  return (
    <Menu
      className={style.leftNav}
      theme="dark"
      mode="inline"
      items={navItems}
      defaultSelectedKeys={["overview"]}
    />
  );
};

export default LeftNav;
