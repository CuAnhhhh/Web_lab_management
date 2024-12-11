import dayjs from "dayjs";
import CustomText from "src/PortalPages/component/CustomText/CustomText";
import CustomTooltip from "src/PortalPages/component/CustomTooltip/CustomTooltip";
import { Scheduler } from "src/PortalPages/model/SchedulerModel";
import { IDateType, TypeTagsProps } from "../SchedulerModel";
import style from "./SchedulerCard.module.scss";

interface ISchedulerCard {
  schedulerItem?: Scheduler.SchedulerModel;
}

const SchedulerCard = ({ schedulerItem }: ISchedulerCard) => {
  return (
    <div className={style.card}>
      <div className={style.title}>
        {TypeTagsProps[schedulerItem?.eventType as IDateType]?.text}
      </div>
      <div className={style.content}>
        <CustomText label="Created By">
          <CustomTooltip content={schedulerItem?.createdBy} maxWidth={186} />
        </CustomText>
        <CustomText label="Project">
          <CustomTooltip content={schedulerItem?.projectId} maxWidth={186} />
        </CustomText>
        <CustomText label="Start time">
          {dayjs(schedulerItem?.startDate).format("DD/MM/YYYY HH:mm")}
        </CustomText>
        <CustomText label="End time">
          {dayjs(schedulerItem?.endDate).format("DD/MM/YYYY HH:mm")}
        </CustomText>
        <CustomText label="Description">
          {schedulerItem?.description}
        </CustomText>
      </div>
    </div>
  );
};

export default SchedulerCard;
