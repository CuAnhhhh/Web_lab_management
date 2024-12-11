import { Button, Modal } from "antd";
import style from "./CustomModal.module.scss";

interface ICustomModal {
  open: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
}

const CustomModal = (props: ICustomModal) => {
  const { open, title, children, onOk, onCancel } = props;

  const renderFooter = () => (
    <>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onOk} type="primary">
        Confirm
      </Button>
    </>
  );

  return (
    <Modal
      title={title}
      open={open}
      footer={renderFooter}
      onCancel={onCancel}
      className={style.customModal}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
