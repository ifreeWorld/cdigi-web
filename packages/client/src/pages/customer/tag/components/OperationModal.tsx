import type { FC } from 'react';
import { ModalForm, ProFormSelect, ProFormText, ProFormColorPicker } from '@ant-design/pro-form';
import { isEmpty } from 'lodash';
import type { CustomerTag } from '../data.d';
import { customerTypeMap } from '../../../../common';

type OperationModalProps = {
  visible: boolean;
  current: Partial<CustomerTag> | undefined;
  onCancel: () => void;
  onSubmit: (values: CustomerTag) => void;
  allTagNames: string[] | undefined;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, current, onCancel, onSubmit, allTagNames = [], children } = props;
  const opType = isEmpty(current) ? 'add' : 'edit';
  if (!visible) {
    return null;
  }
  return (
    <ModalForm<CustomerTag>
      visible={visible}
      title={`${opType === 'add' ? '添加' : '编辑'}标签`}
      width={640}
      onFinish={async (values) => {
        if (opType === 'add') {
          onSubmit(values);
        } else {
          onSubmit({
            ...values,
            // @ts-ignore
            id: current.id,
          });
        }
      }}
      initialValues={current}
      trigger={<>{children}</>}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
      <>
        <ProFormText
          name="tagName"
          label="标签名称"
          rules={[
            { required: true, message: '请输入标签名称' },
            {
              validator: async (rule, value) => {
                if (opType === 'add' && allTagNames.includes(value)) {
                  throw new Error('命名重复');
                } else if (
                  opType === 'edit' &&
                  allTagNames.filter((item) => item !== current?.tagName).includes(value)
                ) {
                  throw new Error('命名重复');
                }
              },
            },
          ]}
          placeholder="请输入标签名称"
        />
        <ProFormSelect
          name="customerType"
          label="标签类型"
          rules={[{ required: true, message: '请选择标签类型' }]}
          valueEnum={customerTypeMap}
          placeholder="请选择标签类型"
          disabled={opType === 'edit'}
        />
        <ProFormColorPicker name="tagColor" label="标签颜色" initialValue={'#2db7f5'} />
      </>
    </ModalForm>
  );
};

export default OperationModal;
