import style from "./CustomText.module.scss";

interface ICustomText {
  label?: string;
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  customStyle?: React.CSSProperties;
}

const CustomText = (props: ICustomText) => {
  const { label, text, children, onClick, customStyle } = props;

  return (
    <div className={style.customText}>
      <div className={style.customTextLabel}>{label}</div>
      <div
        className={`${style.customTextChildren} textChildren`}
        style={customStyle}
        onClick={onClick}
      >
        {text ?? children}
      </div>
    </div>
  );
};

export default CustomText;
