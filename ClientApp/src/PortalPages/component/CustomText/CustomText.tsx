import style from "./CustomText.module.scss";

interface ICustomText {
  label?: string;
  text?: string;
  children?: React.ReactNode;
}

const CustomText = (props: ICustomText) => {
  const { label, text, children } = props;

  return (
    <div className={style.customText}>
      <div className={style.customTextLabel}>{label}</div>
      <div className={style.customTextChildren}>{text ?? children}</div>
    </div>
  );
};

export default CustomText;
