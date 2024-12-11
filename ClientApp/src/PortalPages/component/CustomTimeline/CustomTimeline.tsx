import style from "./CustomTimeline.module.scss";

export interface ICustomTimeline {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  content?: React.ReactNode;
  lastItem?: boolean;
}

const CustomTimeline = (props: ICustomTimeline) => {
  const { icon, content, title, lastItem } = props;

  return (
    <div className={style.customTimeline}>
      <div className={style.TimelineTail}/>
      <div className={style.TimelineIcon}>{icon}</div>
      <div
        className={style.TimelineItem}
        style={{ marginBottom: lastItem ? 0 : 16 }}
      >
        <div className={style.title}>{title}</div>
        <div className={style.content}>{content}</div>
      </div>
    </div>
  );
};

export default CustomTimeline;
