import type { FC } from 'react';
import { useState } from 'react';
import { ModalForm, ProFormTreeSelect } from '@ant-design/pro-form';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  current: any;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, current, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
  return (
    <ModalForm
      visible={visible}
      title="配置"
      width={640}
      onFinish={async (values) => {
        onSubmit({
          ...values,
        });
      }}
      initialValues={{
        ...current,
      }}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
      <>
        <ProFormTreeSelect></ProFormTreeSelect>
      </>
    </ModalForm>
  );
};

export default OperationModal;
