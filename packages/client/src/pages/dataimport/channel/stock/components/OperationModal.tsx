import type { FC } from 'react';
import { ProFormSelect, ModalForm, ProFormDatePicker } from '@ant-design/pro-form';
import { ProFormWeekPicker } from '@/components/WeekPicker';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
  return (
    <ModalForm
      visible={visible}
      title="导入"
      width={640}
      onFinish={async (values) => {}}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
      <>
        <ProFormWeekPicker name="week" label="周" />
      </>
    </ModalForm>
  );
};

export default OperationModal;
