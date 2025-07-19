import { ArrowUpOutlined } from "@ant-design/icons";
import * as signalR from "@microsoft/signalr";
import { Button, notification, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getMessage } from "src/PortalPages/api/ChatboxApi";
import { useLoading } from "src/PortalPages/component/CustomLoading/CustomLoading";
import { Chatbox } from "src/PortalPages/model/ChatboxModel";
import style from "./Content.module.scss";

interface IContent {
  selected?: string;
  selectedName?: string;
  connection?: signalR.HubConnection;
  newMessage?: Chatbox.ChatboxModel;
}

const Content = ({
  selected,
  selectedName,
  newMessage,
  connection,
}: IContent) => {
  const [messages, setMessages] = useState<Chatbox.ChatboxModel[]>([]);
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");
  const { openLoading, closeLoading } = useLoading();
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMessageFunction();
    setMessage("");
  }, [selected]);

  useEffect(() => {
    if (
      newMessage &&
      (selected == newMessage?.receiveId ||
        (newMessage?.sendId == selected &&
          newMessage?.receiveId == userData?.studentId))
    ) {
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [newMessage]);

  const getMessageFunction = async () => {
    try {
      openLoading();
      const result = await getMessage({
        sendId: userData?.studentId,
        receiveId: selected,
        messageType: selected != userData?.projectId && selected != "lab",
      });
      if (result?.isDone) {
        setMessages(result?.messageList ?? []);
      }
      closeLoading();
    } catch (e) {
      notification.open({
        message: "Something went wrong",
        type: "warning",
      });
      closeLoading();
      return;
    }
  };

  const send = async () => {
    if (connection) {
      const model: Chatbox.ChatboxModel = {
        sendId: userData?.studentId,
        receiveId: selected,
        messageType: selected != userData?.projectId && selected != "lab",
        message: message,
        timeStamp: dayjs().format(),
      };
      try {
        openLoading();
        const result = await connection?.invoke("SendMessageToUser", model);
        if (result?.messageId) {
          setMessages((prev) => [...prev, result]);
          setMessage("");
        }
      } catch (e) {
        notification.open({
          message: "Something went wrong",
          type: "warning",
        });
      }
      closeLoading();
    }
  };

  return (
    <div className={style.content}>
      <div className={style.message}>
        {messages?.map((item) => (
          <Tooltip
            title={
              <div style={{ color: "#000" }}>
                {dayjs(item?.timeStamp).format("DD/MMM/YYYY HH:mm")}
              </div>
            }
            rootClassName={style.tooltipMessage}
            color="transparent"
            placement="left"
            trigger={"hover"}
            key={item?.messageId}
          >
            <div
              className={`${style.messageItem} ${
                userData?.studentId == item?.sendId ? style.user : style.other
              }`}
            >
              {item?.message}
            </div>
          </Tooltip>
        ))}
      </div>
      {(selected != "lab" ||
        (selected == "lab" && userData?.studentId == "0")) && (
        <div className={style.send}>
          <div className={style.input}>
            <textarea
              placeholder={`Message for ${selectedName}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
            <Button
              type="primary"
              onClick={!message ? undefined : send}
              icon={<ArrowUpOutlined size={20} />}
              className={`${!message ? style.disableButton : undefined}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
