import {
  BarsOutlined,
  BookOutlined,
  CommentOutlined,
  ContainerOutlined,
  ControlOutlined,
  ProjectOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { MenuItemType } from "antd/es/menu/interface";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import style from "./LeftNav.module.scss";

type CustomMenuItem = MenuItemType & {
  path?: string;
  children?: CustomMenuItem[];
};

interface ILocationParam {
  param: string;
  key: string;
}

const LeftNav = () => {
  const navigate = useNavigate();
  const location = useLocation()?.pathname;
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const isAdmin = userData?.studentId == "0";
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [subSelectedKey, setSubSelectedKey] = useState<string[]>([]);

  useEffect(() => {
    const listParam = location?.split("/").filter((item) => item !== "");
    if (listParam.length == 1) {
      const currentKey =
        locationParam.find((item2) => listParam[0] == item2?.key)?.param ?? "";
      setSelectedKey([currentKey]);
      setSubSelectedKey([]);
    } else {
      const currentKey =
        locationParam.find((item2) => listParam[1] == item2?.key)?.param ?? "";
      const currentSubKey =
        subLocationParam.find((item2) => listParam[0] == item2?.key)?.param ??
        "";
      setSelectedKey([currentKey]);
      setSubSelectedKey([currentSubKey]);
    }
  }, [location]);

  const subLocationParam: ILocationParam[] = [
    {
      param: "projects",
      key: "project",
    },
    {
      param: "cofiguration",
      key: "cofiguration",
    },
  ];

  const locationParam: ILocationParam[] = [
    {
      param: "projectList",
      key: "project-list",
    },
    {
      param: "projectList",
      key: "project-detail",
    },
    {
      param: "projectReport",
      key: "project-report",
    },
    {
      param: "projectReport",
      key: "project-report-detail",
    },
    {
      param: "projectList",
      key: "create-project",
    },
    {
      param: "students",
      key: "student-list",
    },
    {
      param: "students",
      key: "create-student",
    },
    {
      param: "students",
      key: "edit-student",
    },
    {
      param: "students",
      key: "student-detail",
    },
    {
      param: "scheduler",
      key: "scheduler",
    },
    {
      param: "overview",
      key: "overview",
    },
    {
      param: "template",
      key: "template",
    },
    {
      param: "memberList",
      key: "member-list",
    },
    {
      param: "memberList",
      key: "report-detail",
    },
    {
      param: "projectType",
      key: "project-type",
    },
    {
      param: "studentRole",
      key: "student-role",
    },
    {
      param: "chatBox",
      key: "chat-box",
    },
  ];

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
      icon: <ScheduleOutlined />,
      key: "scheduler",
    },
    {
      label: "Template",
      onClick: () => navigate("/template"),
      icon: <BookOutlined />,
      key: "template",
    },
    {
      label: "Students",
      onClick: () => navigate("/student/student-list"),
      icon: <UserOutlined />,
      key: "students",
      disabled: !isAdmin,
    },
    {
      label: "Projects",
      icon: <ContainerOutlined />,
      key: "projects",
      children: [
        {
          label: "Project List",
          onClick: () => navigate("/project/project-list"),
          icon: <ProjectOutlined />,
          key: "projectList",
        },
        {
          label: "Project Report",
          onClick: () => navigate("/project/project-report"),
          icon: <SolutionOutlined />,
          key: "projectReport",
          disabled: !isAdmin && !userData?.isLeader,
        },
      ],
    },
    {
      label: "Member List",
      onClick: () => navigate("/member/member-list"),
      icon: <TeamOutlined />,
      key: "memberList",
      disabled: !userData?.collaboration,
    },
    {
      label: "Cofiguration",
      icon: <ControlOutlined />,
      key: "cofiguration",
      disabled: !isAdmin,
      children: [
        {
          label: "Project Type",
          onClick: () => navigate("/cofiguration/project-type"),
          icon: <SettingOutlined />,
          key: "projectType",
        },
        {
          label: "Student Role",
          onClick: () => navigate("/cofiguration/student-role"),
          icon: <SettingOutlined />,
          key: "studentRole",
        },
      ],
    },
    {
      label: "Chat box",
      onClick: () => navigate("/chat-box"),
      icon: <CommentOutlined />,
      key: "chatBox",
    },
  ];

  return (
    <Menu
      className={style.leftNav}
      theme="dark"
      mode="inline"
      items={navItems}
      selectedKeys={selectedKey}
      openKeys={subSelectedKey}
      onOpenChange={(keys) => setSubSelectedKey(keys)}
    />
  );
};

export default LeftNav;
