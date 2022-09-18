import { Modal, Select, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { request } from 'umi';
import 'moment/locale/zh-cn';

const options: {
  label: number;
  value: string;
  id: number;
}[] = [];

const map = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

function getLabel(i: number) {
  return map[i];
}

for (let i = 0; i < 7; i++) {
  options.push({
    id: i,
    label: getLabel(i),
    value: i + '',
  });
}

const DateSetting: React.FC = () => {
  const [visible, setVisible] = useState(false);
  // 0-6，分别对应星期天-星期六，默认周一
  const [value, setValue] = useState('1');

  const confirm = async () => {
    moment.locale('zh-cn', {
      week: {
        dow: Number(value),
      },
    });
    await request('/api/config/hset', {
      data: {
        key: 'getWeekStartIndex',
        value,
      },
      method: 'POST',
    });
    setVisible(false);
    // localStorage.setItem('weekStartIndex', value);
  };

  const cancel = () => {
    message.warning('请先设置周开始日再开始使用系统');
  };

  const getData = async () => {
    // const weekStartIndex = localStorage.getItem('weekStartIndex');
    // if (weekStartIndex === null) {
    const res = await request('/api/config/hget', {
      params: {
        key: 'getWeekStartIndex',
      },
      method: 'GET',
    });
    if (res.data) {
      // 有就不展示弹层
      setVisible(false);
      setValue(res.data);
      moment.locale('zh-cn', {
        week: {
          dow: Number(res.data),
        },
      });
      // localStorage.setItem('weekStartIndex', res.data);
    } else {
      // 没有就展示弹层
      setVisible(true);
    }
    // }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Modal
      visible={visible}
      title="周开始日设置"
      width="500px"
      destroyOnClose
      centered
      closable={false}
      onOk={confirm}
      onCancel={cancel}
    >
      <div>周开始日</div>
      <Select
        value={value}
        options={options}
        onChange={(v) => {
          setValue(v);
        }}
      />
    </Modal>
  );
};

export default DateSetting;
