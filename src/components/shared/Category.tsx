import classNames from 'classnames';
import styles from '../../styles/Show/Show.module.css';

const Category = ({ name, categoryHexColor }: { name: string, categoryHexColor: string }) => {
  return (
    <div
      className={classNames(styles.showCategory)}
      style={{ backgroundColor: `${categoryHexColor}` }}
    >
      {name.toUpperCase()}
    </div>
  );
};

export default Category;
