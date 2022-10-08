import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import moment from 'moment';
import type { Moment } from 'moment';
import { dateFormat } from '../../constants';
import { useEffect, useState } from 'react';

type RangeValue = [Moment | null, Moment | null] | null;
const { RangePicker } = DatePicker;

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

// 限制了8周的
export const WeekRangePicker = (props: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
}) => {
  const [dates, setDates] = useState<RangeValue>(null);
  const [hackValue, setHackValue] = useState<RangeValue>(null);
  const [value, setValue] = useState<RangeValue>(null);
  const { value: propValue, onChange, placeholder, ...extProps } = props;

  useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  const disabledDate = (current: Moment) => {
    if (!dates) {
      return false;
    }

    let tooLate;
    if (dates[0]) {
      const year = dates[0].year();
      const week = dates[0].week();
      const currentYear = current.year();
      const currentWeek = current.week();
      tooLate =
        moment()
          .year(currentYear)
          .week(currentWeek)
          .diff(moment().year(year).week(week), 'weeks') >= 8;
    }
    let tooEarly;
    if (dates[1]) {
      const year = dates[1].year();
      const week = dates[1].week();
      const currentYear = current.year();
      const currentWeek = current.week();
      tooEarly =
        moment()
          .year(year)
          .week(week)
          .diff(moment().year(currentYear).week(currentWeek), 'weeks') >= 8;
    }
    return !!tooEarly || !!tooLate;
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setHackValue([null, null]);
      setDates([null, null]);
    } else {
      setHackValue(null);
    }
  };

  return (
    <RangePicker
      picker="week"
      value={hackValue || value}
      disabledDate={disabledDate}
      onCalendarChange={(val) => {
        setDates(val);
      }}
      onChange={(val) => {
        setValue(val);
        props.onChange(val);
      }}
      onOpenChange={onOpenChange}
      format={(v) => {
        return moment(v).format('gggg-ww');
      }}
      {...extProps}
    />
  );
};
