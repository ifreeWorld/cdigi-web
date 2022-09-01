import type { FC } from 'react';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';
import { Upload } from 'antd';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import { ProFormWeekPicker } from '@/components/WeekPicker';
import { mimeType, dateFormat } from '@/constants/index';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const OperationModal: FC<OperationModalProps> = (props) => {
  const [file, setFile] = useState<UploadFile>();
  const { visible, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
  const lastWeek = moment().subtract(7, 'days');
  return (
    <ModalForm
      visible={visible}
      title="导入"
      width={640}
      onFinish={async (values) => {
        delete values['filetest'];
        onSubmit({
          ...values,
          file,
        });
      }}
      initialValues={{
        week: lastWeek,
      }}
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
      <>
        <ProFormWeekPicker
          name="week"
          label="周"
          dateFormatter={1}
          transform={(value: string) => {
            const date = moment(value);
            const week = date.format('gggg-w');
            const startDate = date.startOf('week').format(dateFormat);
            const endDate = date.endOf('week').format(dateFormat);
            return {
              week,
              weekStartDate: startDate,
              weekEndDate: endDate,
            };
          }}
        />
        <ProFormUploadDragger
          fieldProps={{
            beforeUpload: (f) => {
              const isXlsx = f.type === mimeType.xlsx;
              if (isXlsx) {
                setFile(f);
              }
              return isXlsx || Upload.LIST_IGNORE;
            },
          }}
          rules={[{ required: true, message: '请上传' }]}
          description={'仅支持上传单个.xlsx文件'}
          max={1}
          accept={mimeType.xlsx}
          label="上传文件"
          name="filetest"
        />
      </>
    </ModalForm>
  );
};

export default OperationModal;
