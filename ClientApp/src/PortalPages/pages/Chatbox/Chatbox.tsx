import * as signalR from "@microsoft/signalr";
import { Badge, notification } from "antd";
import { useEffect, useState } from "react";
import { getStudentChatList } from "src/PortalPages/api/StudentApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { Chatbox } from "src/PortalPages/model/ChatboxModel";
import { Student } from "src/PortalPages/model/StudentModel";
import style from "./Chatbox.module.scss";
import Content from "./Content/Content";

const ChatBox = () => {
  const [studentList, setStudentList] = useState<Student.StudentIdModel[]>([]);
  const [countList, setCountList] = useState<number[]>([]);
  const [newMessage, setNewMessage] = useState<Chatbox.ChatboxModel>();
  const { openLoading, closeLoading } = useLoading();
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const [selected, setSelected] = useState<string>("lab");
  const [connection, setConnection] = useState<signalR.HubConnection>();
  const [allCount, setAllCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  useEffect(() => {
    getStudentChatListFunction();
    const connect = new signalR.HubConnectionBuilder()
      .withUrl(`http://26.243.146.110:7051/chathub?userId=${userData?.studentId}`)
      .build();

    connect
      .start()
      .then(() => setConnection(connect))
      .catch(() => {
        notification.open({
          message: "Something went wrong",
          type: "warning",
        });
      });

    connect.on("ReceiveMessage", (model: Chatbox.ChatboxModel) => {
      setNewMessage(model);
    });

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (
      newMessage?.receiveId != selected &&
      (newMessage?.sendId != selected ||
        newMessage?.receiveId != userData?.studentId)
    ) {
      switch (newMessage?.receiveId) {
        case "lab":
          setAllCount((pre) => pre + 1);
          break;
        case userData?.projectId:
          setProjectCount((pre) => pre + 1);
          break;
        default: {
          if (newMessage?.sendId == "0") {
            setTeacherCount((pre) => pre + 1);
          } else {
            const index = studentList.findIndex(
              (item) => item?.studentId == newMessage?.sendId
            );
            if (index != -1) {
              setCountList((prev) =>
                prev.map((count, i) => (i == index ? count + 1 : count))
              );
            }
          }
        }
      }
    }
  }, [newMessage]);

  const getStudentChatListFunction = async () => {
    try {
      openLoading();
      const result = await getStudentChatList(userData?.studentId);
      if (result?.isDone) {
        setStudentList(result?.studentList ?? []);
        setCountList(Array(result?.studentList?.length).fill(0));
      }
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
    }
    closeLoading();
  };

  const receiveName = () => {
    if (selected == "lab") return "WICOM Lab";
    if (selected == userData?.projectId) return "All Project";
    if (selected == "0") return "Nguyen Thu Nga";
    return studentList.find((item) => item?.studentId == selected)?.studentName;
  };

  const onRenderSiderItem = () =>
    studentList?.map((item, index) => (
      <Badge count={countList[index]} offset={[-10, 0]} key={item?.studentId}>
        <button
          className={`${style.siderItem} ${
            selected == item?.studentId ? style.selected : undefined
          }`}
          onClick={() => {
            setSelected(item?.studentId ?? "");
            setCountList((prev) =>
              prev.map((count, i) => (i == index ? 0 : count))
            );
          }}
        >
          {item?.studentName}
        </button>
      </Badge>
    ));

  return (
    <div style={{ display: "flex" }}>
      <div className={style.sider}>
        <Badge count={allCount} offset={[-10, 0]}>
          <button
            className={`${style.siderItem} ${
              selected == "lab" ? style.selected : undefined
            }`}
            onClick={() => {
              setSelected("lab");
              setAllCount(0);
            }}
          >
            WICOM Lab
          </button>
        </Badge>
        {userData?.projectId &&
          userData?.projectId != "0" &&
          studentList.length != 0 && (
            <Badge count={projectCount} offset={[-10, 0]}>
              <button
                className={`${style.siderItem} ${
                  selected == userData?.projectId ? style.selected : undefined
                }`}
                onClick={() => {
                  setProjectCount(0);
                  setSelected(userData?.projectId);
                }}
              >
                All project
              </button>
            </Badge>
          )}
        {userData?.studentId != "0" && (
          <Badge count={teacherCount} offset={[-10, 0]}>
            <button
              className={`${style.siderItem} ${
                selected == "0" ? style.selected : undefined
              }`}
              onClick={() => {
                setTeacherCount(0);
                setSelected("0");
              }}
            >
              Teacher
            </button>
          </Badge>
        )}
        {onRenderSiderItem()}
      </div>
      <div className={style.content}>
        {selected && (
          <Content
            selected={selected}
            selectedName={receiveName()}
            newMessage={newMessage}
            connection={connection}
          />
        )}
      </div>
    </div>
  );
};

export default ChatBox;
