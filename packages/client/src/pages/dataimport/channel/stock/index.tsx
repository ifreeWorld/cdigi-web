import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useRequest } from 'umi';
import { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';
import type { StockItem } from './data';
import type { TablePagination } from '../../../../types/common';
import {
  getStock,
  parseFile,
  deleteStock,
  downloadTemplate,
  downloadErrorExcel,
  save,
} from './service';
import OperationModal from './components/OperationModal';
import { WeekPicker } from '../../../../components/WeekPicker';
import { dateFormat } from '@/common/index';

const Stock = ({ customerId }: { customerId: number }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cacheData, setCacheData] = useState([]);
  const [modalWeeks, setModalWeeks] = useState([]);
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCacheData([]);
    setModalWeeks([]);
  };

  const handleCover = async () => {
    const res = await save({
      data: cacheData,
      customerId,
      type: 'cover',
    });
    handleModalCancel();
    if (res.code === 0) {
      setVisible(false);
      actionRef.current?.reloadAndRest?.();
      message.success('覆盖数据成功');
    } else {
      message.error(res.msg);
    }
  };

  const handleAdd = async (data?: any) => {
    const res = await save({
      data: data || cacheData,
      customerId,
      type: 'add',
    });
    handleModalCancel();
    if (res.code === 0) {
      setVisible(false);
      actionRef.current?.reloadAndRest?.();
      message.success('添加数据成功');
    } else {
      message.error(res.msg);
    }
  };

  const { run } = useRequest(
    async (params) => {
      return await getStock(params);
    },
    {
      manual: true,
    },
  );

  const { run: postRun } = useRequest(
    async (method: 'add' | 'remove', params) => {
      if (method === 'remove') {
        await deleteStock(params);
        message.success('删除成功');
      }
      if (method === 'add') {
        const res = await parseFile(params);
        // 校验失败
        if (res.code === 6) {
          message.error(res.message);
          await downloadErrorExcel({
            fileName: res.data,
          });
        } else if (res.code === 0) {
          const { repeatWeekCount, repeatWeeks, data } = res.data;
          // 存在重复，就提示
          if (repeatWeekCount && repeatWeekCount !== 0) {
            setIsModalVisible(true);
            setCacheData(data);
            setModalWeeks(repeatWeeks);
          } else {
            // 无重复，直接调用接口
            handleAdd(data);
          }
        }
      }
    },
    {
      manual: true,
      onSuccess: () => {
        setVisible(false);
        actionRef.current?.reloadAndRest?.();
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const columns: ProColumns<StockItem>[] = [
    {
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '周',
      dataIndex: 'week',
      colSize: 2,
      renderFormItem: (item, { type, fieldProps }) => {
        if (type === 'form') {
          return null;
        }
        return <WeekPicker {...fieldProps} />;
      },
      // hideInSearch: true,
    },
    {
      title: '周开始时间',
      dataIndex: 'weekStartDate',
      hideInSearch: true,
    },
    {
      title: '周结束时间',
      dataIndex: 'weekEndDate',
      hideInSearch: true,
    },
    {
      title: '日期',
      dataIndex: 'date',
      hideInSearch: true,
    },
    {
      title: '门店',
      dataIndex: 'storeName',
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
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => {
        if (record.children) {
          return [
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
                      weeks: [record.week],
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

  const dataFormat = (date: moment.Moment, dateString: string) => {
    const weekStr = date.format('gggg-w');
    const year = Number(weekStr.split('-')[0]);
    const week = Number(weekStr.split('-')[1]);
    const startDate = date.startOf('week').format(dateFormat);
    const endDate = date.endOf('week').format(dateFormat);
    console.log(date, dateString);
    console.log('year', year);
    console.log('week', week);
    console.log('weekStr', weekStr);
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    console.log(moment().year(year).week(week).startOf('week').format('YYYY-MM-DD'));
    console.log(moment().year(year).week(week).endOf('week').format('YYYY-MM-DD'));
    return weekStr;
  };

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

  return (
    <>
      <ProTable<StockItem, TablePagination>
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
              // 下载
              downloadTemplate({
                fileName: 'stock_template.xlsx',
              });
            }}
          >
            <DownloadOutlined /> 导出
          </Button>,
        ]}
        dateFormatter={dataFormat}
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
      <Modal
        visible={isModalVisible}
        title="周数据存在重复"
        destroyOnClose
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleCover}>
            覆盖
          </Button>,
        ]}
      >
        <p>{modalWeeks.join('、')}数据存在重复</p>
      </Modal>
      <OperationModal visible={visible} onCancel={handleCancel} onSubmit={handleSubmit} />
    </>
  );
};

export default Stock;
