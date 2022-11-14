export const formatPerfect = (v: number | 'n/a') => {
  if (!v) {
    return `0%`;
  }
  if (v === 'n/a') {
    return v;
  }
  return `${v * 100}%`;
};

export const formatNumber = (v: number | 'n/a') => {
  if (!v) {
    return '0';
  }
  if (v === 'n/a') {
    return v;
  }
  return `${v}`;
};

export const toRed = (v: string) => {
  if (v === '0' || v === '0%' || v[0] === '-') {
    return `<span style="color: red">${v}</span>`;
  }
  return v;
};
