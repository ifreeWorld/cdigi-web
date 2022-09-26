import type { FC } from 'react';
import { useState } from 'react';
import { Select } from 'sensd';
import ProForm, { ModalForm, ProFormTreeSelect } from '@ant-design/pro-form';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  current: any;
  modalOptions: any[];
  detailField: string;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, current = {}, modalOptions = [], detailField = '', onCancel, onSubmit } = props;
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
        <ProForm.Item name={detailField}>
          <Select
            mode="multiple"
            showDropdownSearch
            showCheckAll
            showConfirm
            selectorSimpleMode
            options={modalOptions}
            selectAllText="全选"
          ></Select>
        </ProForm.Item>
      </>
    </ModalForm>
  );
};

export default OperationModal;
