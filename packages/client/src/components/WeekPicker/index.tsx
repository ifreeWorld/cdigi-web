import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import moment from 'moment';
import { dateFormat } from '../../common';

const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
  `${moment(value).startOf('week').format(dateFormat)} ~ ${moment(value)
    .endOf('week')
    .format(dateFormat)}`;

export const WeekPicker = (props: any) => {
  return <DatePicker {...props} picker="week" format={customWeekStartEndFormat} />;
};

export const ProFormWeekPicker = (props: any) => {
  return <ProFormDatePicker {...props} picker="week" format={customWeekStartEndFormat} />;
};
