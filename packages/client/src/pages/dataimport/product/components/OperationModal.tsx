import type { FC } from 'react';
import { useRef } from 'react';
import { Tag, AutoComplete } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProForm, ProFormText } from '@ant-design/pro-form';
import { isEmpty } from 'lodash';
import type { ProductListItem } from '../data.d';
import type { CustomerTag } from '../../../customer/tag/data.d';

type OperationModalProps = {
  visible: boolean;
  current: Partial<ProductListItem> | undefined;
  onCancel: () => void;
  onSubmit: (values: ProductListItem) => void;
  allTagList: CustomerTag[] | undefined;
  allProductNames: string[] | undefined;
  allVendorNames: string[] | undefined;
  allFirstNames: string[] | undefined;
  allSecondNames: string[] | undefined;
  allThirdNames: string[] | undefined;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const {
    visible,
    current,
    allTagList = [],
    allProductNames = [],
    allVendorNames = [],
    allFirstNames = [],
    allSecondNames = [],
    allThirdNames = [],
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
    <ModalForm<ProductListItem>
      formRef={formRef}
      visible={visible}
      title={`${opType === 'add' ? '添加' : '编辑'}产品`}
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
      }}
      trigger={<>{children}</>}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
      onValuesChange={(changeValues) => {
        if (changeValues.productType) {
          formRef?.current?.setFieldsValue?.({
            tags: [],
            parent: [],
          });
        }
      }}
    >
      <>
        <ProFormText
          name="productName"
          label="产品型号"
          rules={[
            { required: true, message: '请输入产品型号' },
            {
              validator: async (rule, value) => {
                if (opType === 'add' && allProductNames.includes(value)) {
                  throw new Error('命名重复');
                } else if (
                  opType === 'edit' &&
                  allProductNames.filter((item) => item !== current?.productName).includes(value)
                ) {
                  throw new Error('命名重复');
                }
              },
            },
          ]}
          placeholder="请输入"
          disabled={opType === 'edit'}
        />
        <ProForm.Item
          name="vendorName"
          label="品牌"
          rules={[{ required: true, message: '请输入品牌' }]}
        >
          <AutoComplete
            placeholder="请输入品牌"
            options={allVendorNames.map((item) => ({ value: item }))}
          />
        </ProForm.Item>
        <ProForm.Item name="categoryFirstName" label="一级分类">
          <AutoComplete
            placeholder="请输入一级分类"
            options={allFirstNames.map((item) => ({ value: item }))}
          />
        </ProForm.Item>
        <ProForm.Item name="categorySecondName" label="二级分类">
          <AutoComplete
            placeholder="请输入二级分类"
            options={allSecondNames.map((item) => ({ value: item }))}
          />
        </ProForm.Item>
        <ProForm.Item name="categoryThirdName" label="三级分类">
          <AutoComplete
            placeholder="请输入三级分类"
            options={allThirdNames.map((item) => ({ value: item }))}
          />
        </ProForm.Item>
        {/* <ProFormText name="categoryFirstName" label="一级分类" placeholder="请输入一级分类" />
        <ProFormText name="categorySecondName" label="二级分类" placeholder="请输入二级分类" />
        <ProFormText name="categoryThirdName" label="三级分类" placeholder="请输入三级分类" /> */}
        <ProFormSelect
          name="tags"
          mode="multiple"
          label="标签"
          tooltip="请先选择用户类型，再选择标签"
          placeholder="请先选择用户类型，再选择标签"
          transform={(values: number[], name) => {
            return {
              [name]: values?.map((id) => ({
                id,
              })),
            };
          }}
          request={async () => {
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
      </>
    </ModalForm>
  );
};

export default OperationModal;
