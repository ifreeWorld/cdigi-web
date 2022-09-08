import type { FC } from 'react';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { StoreListItem } from '../data.d';
import type { Option } from '../../../../types/common';

type OperationModalProps = {
  opType: 'add' | 'edit';
  visible: boolean;
  current: Partial<StoreListItem> | undefined;
  onCancel: () => void;
  onSubmit: (values: StoreListItem) => void;
  allStoreNames: string[] | undefined;
  allDealers: Option[] | undefined;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const {
    opType,
    visible,
    current,
    allStoreNames = [],
    allDealers = [],
    onCancel,
    onSubmit,
    children,
  } = props;
  if (!visible) {
    return null;
  }

  return (
    <ModalForm<StoreListItem>
      formRef={formRef}
      visible={visible}
      title={`${opType === 'add' ? '添加' : '编辑'}客户`}
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
      initialValues={{
        ...current,
        customer: current?.customer ? current?.customer?.id : '',
      }}
      trigger={<>{children}</>}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onValuesChange={(changeValues) => {
        if (changeValues.storeType) {
          formRef?.current?.setFieldsValue?.({
            tags: [],
          });
        }
      }}
    >
      <>
        <ProFormText
          name="storeName"
          label="门店名称"
          rules={[
            { required: true, message: '请输入门店名称' },
            {
              validator: async (rule, value) => {
                if (opType === 'add' && allStoreNames.includes(value)) {
                  throw new Error('命名重复');
                } else if (
                  opType === 'edit' &&
                  allStoreNames.filter((item) => item !== current?.storeName).includes(value)
                ) {
                  throw new Error('命名重复');
                }
              },
            },
          ]}
          placeholder="请输入"
          disabled={opType === 'edit'}
        />
        <ProFormSelect
          name="customer"
          label="所属经销商"
          placeholder="请选择"
          rules={[{ required: true, message: '请选择所属经销商' }]}
          transform={(value: number, name) => {
            return {
              [name]: {
                id: value,
              },
            };
          }}
          options={allDealers}
        />
        <ProFormText name="region" label="区域" placeholder="请输入" />
        <ProFormText name="storeAddress" label="门店地址" placeholder="请输入" />
      </>
    </ModalForm>
  );
};

export default OperationModal;
