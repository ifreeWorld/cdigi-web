import type { FC } from 'react';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { Upload } from 'antd';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import { mimeType } from '@/constants/index';

type OperationModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const ImportOperationModal: FC<OperationModalProps> = (props) => {
  const [file, setFile] = useState<UploadFile>();
  const { visible, onCancel, onSubmit } = props;
  if (!visible) {
    return null;
  }
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
      modalProps={{
        onCancel: () => onCancel(),
        destroyOnClose: true,
      }}
    >
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
    </ModalForm>
  );
};

export default ImportOperationModal;
