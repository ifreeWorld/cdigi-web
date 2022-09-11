import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useRequest } from 'umi';
import { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TransitItem } from './data';
import type { TablePagination } from '../../../../types/common';
import {
  getTransit,
  parseFile,
  deleteTransit,
  update,
  downloadTemplate,
  downloadErrorExcel,
  exportData,
} from './service';
import OperationModal from './components/OperationModal';
import UpdateOperationModal from './components/UpdateOperationModal';

const Transit = ({ customerId }: { customerId: number }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [warehouseVisible, setWarehouseVisible] = useState<boolean>(false);
  const [etcVisible, setEtcVisible] = useState<boolean>(false);
  const [inTime, setInTime] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();

  const { run } = useRequest(
    async (params) => {
      return await getTransit(params);
    },
    {
      manual: true,
    },
  );

  const { run: postRun } = useRequest(
    async (method: 'add' | 'remove' | 'in' | 'updateEtc', params) => {
      if (method === 'remove') {
        await deleteTransit(params);
        message.success('删除成功');
      }
      if (method === 'add') {
        const res = await parseFile(params);
        if (res.code === 6) {
          message.error(res.message);
          downloadErrorExcel({
            fileName: res.data,
          });
          return;
        }
        message.success('添加成功');
      }
      if (method === 'in') {
        await update(params);
        message.success('入库成功');
      }
      if (method === 'updateEtc') {
        await update(params);
        message.success('更新预计到达时间成功');
      }
    },
    {
      manual: true,
      onSuccess: () => {
        setVisible(false);
        setWarehouseVisible(false);
        setEtcVisible(false);
        actionRef.current?.reloadAndRest?.();
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const columns: ProColumns<TransitItem>[] = [
    {
      title: '录入系统时间',
      dataIndex: 'inTime',
      hideInSearch: true,
    },
    {
      title: '产品型号',
      dataIndex: 'productName',
      hideInSearch: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      hideInSearch: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      hideInSearch: true,
    },
    {
      title: '总额',
      dataIndex: 'total',
      hideInSearch: true,
    },
    {
      title: '预计到达时间',
      dataIndex: 'eta',
      hideInSearch: true,
    },
    {
      title: '运输时间',
      dataIndex: 'shippingDate',
      hideInSearch: true,
    },
    {
      title: '入库时间',
      dataIndex: 'warehousingDate',
      hideInSearch: true,
      render: (text, record) => {
        if (!record.warehousingDate) {
          return '未入库';
        }
        return text;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => {
        if (record.children) {
          return [
            <a
              style={record.warehousingDate ? { cursor: 'not-allowed', color: '#aaa' } : {}}
              key="in"
              onClick={() => {
                if (record.warehousingDate) {
                  return;
                }
                setWarehouseVisible(true);
                setInTime(record.inTime);
              }}
            >
              入库
            </a>,
            <a
              key="updateEtc"
              onClick={() => {
                setEtcVisible(true);
                setInTime(record.inTime);
              }}
            >
              更新
            </a>,
            <a
              key="delete"
              onClick={() => {
                Modal.confirm({
                  title: '删除',
                  content: '确定删除吗？',
                  okText: '确认',
                  cancelText: '取消',
                  onOk: () => {
                    postRun('remove', {
                      inTimes: [record.inTime],
                      customerId,
                    });
                  },
                });
              }}
            >
              删除
            </a>,
          ];
        }
      },
    },
  ];

  useEffect(() => {
    actionRef.current?.reset?.();
    // 默认切换时进入本周，注释掉就是默认切换时不选周
    // searchRef.current?.setFieldsValue?.({
    //   week: moment(),
    // });
    searchRef.current?.submit?.();
  }, [customerId]);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }
    formData.append('customerId', customerId);
    postRun('add', formData);
  };

  const handleWarehouseCancel = () => {
    setWarehouseVisible(false);
  };

  const handleWarehouseSubmit = (values: any) => {
    postRun('in', {
      inTime,
      customerId,
      ...values,
    });
  };

  const handleEtcCancel = () => {
    setEtcVisible(false);
  };

  const handleEtcSubmit = (values: any) => {
    postRun('updateEtc', {
      inTime,
      customerId,
      ...values,
    });
  };

  return (
    <>
      <ProTable<TransitItem, TablePagination>
        actionRef={actionRef}
        formRef={searchRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setVisible(true);
            }}
          >
            <UploadOutlined /> 导入
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              exportData(customerId);
            }}
          >
            <UploadOutlined /> 导出
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              // 下载
              downloadTemplate({
                fileName: 'transit_template.xlsx',
              });
            }}
          >
            <DownloadOutlined /> 下载在途库存模板
          </Button>,
        ]}
        request={async (params) => {
          if (!customerId) {
            return {
              data: [],
              total: 0,
              success: true,
            };
          }
          const res = await run({
            ...params,
            customerId,
          });
          return {
            data: res.list,
            total: res.total,
            success: true,
          };
        }}
        columns={columns}
      />
      <OperationModal visible={visible} onCancel={handleCancel} onSubmit={handleSubmit} />
      <UpdateOperationModal
        field="warehousingDate"
        title="入库"
        visible={warehouseVisible}
        onCancel={handleWarehouseCancel}
        onSubmit={handleWarehouseSubmit}
      />
      <UpdateOperationModal
        field="eta"
        title="更新预计到达时间"
        visible={etcVisible}
        onCancel={handleEtcCancel}
        onSubmit={handleEtcSubmit}
      />
    </>
  );
};

export default Transit;
