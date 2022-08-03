import type { FC } from 'react';
import { Tag } from 'antd';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { isEmpty } from 'lodash';
import { getTag } from '../../tag/service';
import type { CustomerListItem } from '../data.d';
import { customerTypeMap } from '../../../../common';

type OperationModalProps = {
  visible: boolean;
  current: Partial<CustomerListItem> | undefined;
  onCancel: () => void;
  onSubmit: (values: CustomerListItem) => void;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, current, onCancel, onSubmit, children } = props;
  if (!visible) {
    return null;
  }

  const tagRender = (tagProps: any) => {
    const { label, value, closable, onClose } = tagProps;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={value}
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
      visible={visible}
      title={`${isEmpty(current) ? '添加' : '编辑'}客户`}
      width={640}
      onFinish={async (values) => {
        onSubmit(values);
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
          name="customerName"
          label="用户名称"
          rules={[{ required: true, message: '请输入用户名称' }]}
          placeholder="请输入"
        />
        <ProFormSelect
          name="customerType"
          label="用户类型"
          rules={[{ required: true, message: '请选择用户类型' }]}
          valueEnum={customerTypeMap}
          placeholder="请选择用户类型"
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
        <ProFormSelect
          name="tag"
          label="标签"
          tooltip="请先选择用户类型，再选择标签"
          placeholder="请先选择用户类型，再选择标签"
          dependencies={['customerType']}
          request={async (params) => {
            const { customerType } = params;
            if (!customerType) {
              return [];
            }
            const res = await getTag({});
            return res.data;
          }}
          fieldProps={{ tagRender }}
        />
      </>
    </ModalForm>
  );
};

export default OperationModal;
