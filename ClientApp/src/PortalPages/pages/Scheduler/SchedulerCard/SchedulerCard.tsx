import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs from "dayjs";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Scheduler } from "src/PortalPages/model/SchedulerModel";
import { IDateType, TypeTagsProps } from "../SchedulerModel";
import style from "./SchedulerCard.module.scss";

interface ISchedulerCard {
  schedulerItem?: Scheduler.SchedulerModel;
  deleteFunction?: (id?: string) => void;
}

const SchedulerCard = ({ schedulerItem, deleteFunction }: ISchedulerCard) => {
  const userData = JSON.parse(localStorage.getItem("userData") ?? "null");

  return (
    <div className={style.card}>
      <div className={style.title}>
        {TypeTagsProps[schedulerItem?.eventType as IDateType]?.text}
        <CustomTooltip content="Delete">
          <Button
            icon={<DeleteOutlined />}
            type="text"
            onClick={() => deleteFunction?.(schedulerItem?.schedulerId)}
            style={{
              display:
                userData.studentId == "0" ||
                schedulerItem?.createdBy == userData.studentId
                  ? undefined
                  : "none",
            }}
          />
        </CustomTooltip>
      </div>
      <div className={style.content}>
        <CustomText label="Created By">
          <CustomTooltip
            content={schedulerItem?.createdByName ?? "Admin"}
            maxWidth={186}
          />
        </CustomText>
        <CustomText label="Project">
          <CustomTooltip content={schedulerItem?.projectName} maxWidth={186} />
        </CustomText>
        <CustomText label="Start time">
          {dayjs(schedulerItem?.startDate).format("DD/MM/YYYY HH:mm")}
        </CustomText>
        <CustomText label="End time">
          {dayjs(schedulerItem?.endDate).format("DD/MM/YYYY HH:mm")}
        </CustomText>
        <CustomText label="Description">
          <CustomTooltip content={schedulerItem?.description} maxWidth={186} />
        </CustomText>
      </div>
    </div>
  );
};

export default SchedulerCard;
