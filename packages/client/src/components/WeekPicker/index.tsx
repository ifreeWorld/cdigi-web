import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import moment from 'moment';

const format = 'YYYY-MM-DD';
const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
  `${moment(value).startOf('week').format(format)} ~ ${moment(value).endOf('week').format(format)}`;

export const WeekPicker = (props: any) => {
  return <DatePicker {...props} picker="week" format={customWeekStartEndFormat} />;
};

export const ProFormWeekPicker = (props: any) => {
  return <ProFormDatePicker {...props} picker="week" format={customWeekStartEndFormat} />;
};
