import type { FC } from 'react';
import { useRef } from 'react';
import { Tag } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { isEmpty } from 'lodash';
import type { CustomerListItem } from '../data.d';
import type { CustomerTag } from '../../tag/data.d';
import { customerTypeMap } from '../../../../constants';

type OperationModalProps = {
  visible: boolean;
  current: Partial<CustomerListItem> | undefined;
  onCancel: () => void;
  onSubmit: (values: CustomerListItem) => void;
  allTagList: CustomerTag[] | undefined;
  allCustomerList: CustomerListItem[] | undefined;
  allCustomerNames: string[] | undefined;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const {
    visible,
    current,
    allTagList = [],
    allCustomerList = [],
    allCustomerNames = [],
    onCancel,
    onSubmit,
    children,
  } = props;
  if (!visible) {
    return null;
  }
  const opType = isEmpty(current) ? 'add' : 'edit';

  const tagRender = (tagProps: any) => {
    const { label, value, closable, onClose } = tagProps;
    const cur = allTagList.find((item) => item.id === value * 1);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={cur?.tagColor}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <ModalForm<CustomerListItem>
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
        tags: current?.tags?.map((item) => item.id),
        parent: current?.parent?.map((item) => item.id),
      }}
      trigger={<>{children}</>}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onValuesChange={(changeValues) => {
        if (changeValues.customerType) {
          formRef?.current?.setFieldsValue?.({
            tags: [],
            parent: [],
          });
        }
      }}
    >
      <>
        <ProFormText
          name="customerName"
          label="用户名称"
          rules={[
            { required: true, message: '请输入用户名称' },
            {
              validator: async (rule, value) => {
                if (opType === 'add' && allCustomerNames.includes(value)) {
                  throw new Error('命名重复');
                } else if (
                  opType === 'edit' &&
                  allCustomerNames.filter((item) => item !== current?.customerName).includes(value)
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
          name="customerType"
          label="用户类型"
          rules={[{ required: true, message: '请选择用户类型' }]}
          valueEnum={customerTypeMap}
          placeholder="请选择用户类型"
          disabled={opType === 'edit'}
        />
        <ProFormText
          name="country"
          label="国家"
          rules={[{ required: true, message: '请输入国家' }]}
          placeholder="请输入国家"
        />
        <ProFormText
          name="region"
          label="区域"
          rules={[{ required: true, message: '请输入区域' }]}
          placeholder="请输入区域"
        />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[{ required: true, message: '请输入邮箱' }]}
          placeholder="请输入邮箱"
        />
        <ProFormSelect
          name="tags"
          mode="tags"
          label="标签"
          tooltip="请先选择用户类型，再选择标签"
          placeholder="请先选择用户类型，再选择标签"
          dependencies={['customerType']}
          transform={(values: number[], name) => {
            return {
              [name]: values?.map((id) => ({
                id,
              })),
            };
          }}
          request={async (params) => {
            const { customerType } = params;
            if (!customerType) {
              return [];
            }
            const res = allTagList.map((item) => {
              return {
                label: item.tagName,
                value: item.id,
              };
            });
            return res;
          }}
          fieldProps={{ tagRender }}
        />
        <ProFormSelect
          name="parent"
          mode="tags"
          label="所属用户"
          tooltip="请先选择用户类型，再选择所属用户"
          placeholder="请先选择用户类型，再选择所属用户"
          transform={(value, name) => {
            return {
              [name]: value?.map((v: number) => ({
                id: v,
              })),
            };
          }}
          dependencies={['customerType']}
          request={async (params) => {
            const { customerType } = params;
            const res = allCustomerList
              .filter((item) => item.customerType < customerType)
              .map((item) => {
                return {
                  label: item.customerName,
                  value: item.id,
                };
              });
            return res;
          }}
        />
      </>
    </ModalForm>
  );
};

export default OperationModal;
