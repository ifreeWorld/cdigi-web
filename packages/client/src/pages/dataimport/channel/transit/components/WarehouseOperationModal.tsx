import type { FC } from 'react';
import { ModalForm, ProFormDatePicker } from '@ant-design/pro-form';
import { dateFormat } from '@/constants/index';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const WarehouseOperationModal: FC<OperationModalProps> = (props) => {
  const { visible, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
  return (
    <ModalForm
      visible={visible}
      title="导入"
      width={640}
      onFinish={async (values) => {
        onSubmit({
          ...values,
        });
      }}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
      <ProFormDatePicker name="warehousingDate" fieldProps={{ format: dateFormat }} />
    </ModalForm>
  );
};

export default WarehouseOperationModal;
