import classNames from "classnames";
import styles from "@/styles/Show/Show.module.css";

type ShowTitleProps = {
  title: string;
};

export default function ShowTitle({ title }: ShowTitleProps) {
  return (
    <h1 className={classNames(styles.showTitle)}>
      {title.toUpperCase()}
    </h1>
  );
}
