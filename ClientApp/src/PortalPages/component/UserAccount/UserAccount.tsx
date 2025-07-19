import { Avatar, Dropdown, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import style from "./UserAccount.module.scss";

const UserAccount = () => {
  const items: MenuProps["items"] = [
    {
      label: "Logout",
      key: "0",
      onClick: () => {
        localStorage.setItem("userData", "");
        window.location.href = "http://26.243.146.110:3000/login";
      },
    },
  ];

  return (
    <div className={style.userAccount}>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        arrow={{ pointAtCenter: true }}
        placement="bottomRight"
      >
        <Avatar size={36} icon={<UserOutlined />} />
      </Dropdown>
    </div>
  );
};

export default UserAccount;
