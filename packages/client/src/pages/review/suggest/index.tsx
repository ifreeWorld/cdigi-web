import { PageContainer } from '@ant-design/pro-layout';
import UploadSummary from './components/UploadSummary';
import styles from './style.less';

const Suggest = () => {
  return (
    <PageContainer className={styles.pageContainer}>
      <UploadSummary />
    </PageContainer>
  );
};

export default Suggest;
