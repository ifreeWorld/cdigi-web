// import { PlusOutlined } from '@ant-design/icons';
import { DatePicker, ConfigProvider } from 'antd';
import type { DatePickerProps } from 'antd';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import locale from 'antd/es/locale/zh_CN';
import moment from 'moment';
// import type { CustomerTag } from './data';
// import { getTag, addTag, updateTag, deleteTag } from './service';
const format = 'YYYY-MM-DD';
window.moment = moment;
const TableList: React.FC = () => {
  const onChange = (date, dateString) => {
    const weekStr = date.format('gggg-w');
    const year = weekStr.split('-')[0];
    const week = weekStr.split('-')[1];
    const startDate = date.startOf('week').format(format);
    const endDate = date.endOf('week').format(format);
    console.log(date, dateString);
    console.log('year', year);
    console.log('week', week);
    console.log('weekStr', weekStr);
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    console.log(moment().year(year).week(week).startOf('week').format('YYYY-MM-DD'));
    console.log(moment().year(year).week(week).endOf('week').format('YYYY-MM-DD'));
  };

  const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
    `${moment(value).startOf('week').format(format)} ~ ${moment(value)
      .endOf('week')
      .format(format)}`;

  return (
    <PageContainer>
      <ConfigProvider locale={locale}>
        <DatePicker picker="week" onChange={onChange} format={customWeekStartEndFormat} />
      </ConfigProvider>
    </PageContainer>
  );
};

export default TableList;
