import type { FC } from 'react';
import { Select, TreeSelect } from 'sensd';
import ProForm, { ModalForm } from '@ant-design/pro-form';
import type { DropKeyEnum } from '../data';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  current: any;
  modalOptions: any[];
  detailConfig: { key: DropKeyEnum; field: string };
};

const aggregators = [
  {
    value: 'sum',
    label: '求和',
  },
  {
    value: 'count',
    label: '计数',
  },
  {
    value: 'avg',
    label: '平均值',
  },
  {
    value: 'max',
    label: '最大值',
  },
  {
    value: 'min',
    label: '最小值',
  },
];

const OperationModal: FC<OperationModalProps> = (props) => {
  const { visible, current = {}, modalOptions = [], detailConfig, onCancel, onSubmit } = props;
  if (!visible || !detailConfig) {
    return null;
  }
  const { key, field } = detailConfig;
  let select = (
    <Select
      mode="multiple"
      showDropdownSearch
      showCheckAll
      showConfirm
      selectorSimpleMode
      options={modalOptions}
      selectAllText="全选"
    />
  );

  // 值，展示聚合类型
  if (key === 'value') {
    select = <Select options={aggregators} />;
  }

  // 展示tree select
  if (field === 'customerName') {
    const result = [
      {
        title: '品牌商',
        selectable: false,
        key: 'vendor',
        value: 'vendor',
        children: [],
      },
      {
        title: '代理商',
        selectable: false,
        key: 'disty',
        value: 'disty',
        children: [],
      },
      {
        title: '经销商',
        selectable: false,
        key: 'dealer',
        value: 'dealer',
        children: [],
      },
    ];
    if (modalOptions && modalOptions.length > 0) {
      modalOptions.forEach((customer) => {
        if (customer.customerType) {
          const child = {
            title: customer.label,
            key: customer.value,
            value: customer.value,
            customerType: customer.customerType,
          };
          // @ts-ignore
          result[customer.customerType - 1].children.push(child);
        }
      });
    }
    select = (
      <TreeSelect
        treeData={result}
        showSearch
        showCheckAll
        showConfirm
        multiple
        selectorSimpleMode
        selectAllText="全选"
      />
    );
  }

  // 展示tree select
  if (field === 'buyerName') {
  }

  // 展示tree select
  if (field === 'storeName') {
  }
  // TODO 4.国家&区域

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
        <ProForm.Item name={field}>{select}</ProForm.Item>
      </>
    </ModalForm>
  );
};

export default OperationModal;
