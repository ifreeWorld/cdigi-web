import type { FC } from 'react';
import { ModalForm, ProFormDatePicker } from '@ant-design/pro-form';
import { dateFormat } from '@/constants/index';

type OperationModalProps = {
  field: { field: string; label?: string | JSX.Element }[];
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const UpdateOperationModal: FC<OperationModalProps> = (props) => {
  const { visible, title, field, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
  return (
    <ModalForm
      visible={visible}
      title={title}
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
      {field.map((item) => {
        return (
          <ProFormDatePicker
            key={item.field}
            name={item.field}
            label={item.label}
            fieldProps={{ format: dateFormat }}
          />
        );
      })}
    </ModalForm>
  );
};

export default UpdateOperationModal;
