import { useLocation } from 'umi';

export default () => {
  const location = useLocation();
  return (
    <div>
      <ul>
        <li>location: {JSON.stringify(location)}</li>
      </ul>
    </div>
  );
};
